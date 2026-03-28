import { Request, Response } from "express";
import Product from "../../models/Product";
import Category from "../../models/Category";
import Offer from "../../models/Offer";
import { cacheGet, cacheSet, CACHE_TTL } from "../../utils/cache";
import { escapeRegex } from "../../utils/escapeRegex";
import { buildStemFilter } from "../../utils/stemSearch";

function computeDiscountedPrice(price: number, discountType: string, discountValue: number): number {
  if (discountType === "percentage") return Math.round(price * (1 - discountValue / 100));
  return Math.max(0, price - discountValue);
}

async function enrichWithActiveOffers(products: any[]): Promise<any[]> {
  if (!products.length) return products;
  const ids = products.map(p => p._id);
  const now = new Date();
  const offers = await Offer.find({
    isActive: true,
    productIds: { $in: ids },
    $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }],
  }).lean();

  // Filter by endDate in app code
  const activeOffers = offers.filter(o => !o.endDate || o.endDate > now);

  const offerMap = new Map<string, any>();
  for (const offer of activeOffers) {
    for (const pid of offer.productIds) {
      offerMap.set(pid.toString(), offer);
    }
  }

  return products.map(p => {
    const offer = offerMap.get(p._id.toString());
    if (!offer) return p;
    return {
      ...p,
      activeOffer: {
        offerId: offer._id,
        label: offer.label,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        discountedPrice: computeDiscountedPrice(p.price, offer.discountType, offer.discountValue),
      },
    };
  });
}

/**
 * GET /api/v1/products
 * Public — returns only active products with pagination, search, filtering, sorting
 * Search uses Porter stemming so "shoes" matches "Running Sneakers", "shoe" etc.
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const search = (req.query.search as string || "").trim();
    const category = (req.query.category as string || "").trim();
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    const sort = (req.query.sort as string || "newest").trim();
    const skip = (page - 1) * limit;

    const baseFilter: Record<string, unknown> = { status: "active" };

    if (category) {
      baseFilter.category = { $regex: new RegExp(`^${escapeRegex(category)}`, "i") };
    }

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      const priceFilter: Record<string, number> = {};
      if (!isNaN(minPrice)) priceFilter.$gte = minPrice;
      if (!isNaN(maxPrice)) priceFilter.$lte = maxPrice;
      baseFilter.price = priceFilter;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest:       { createdAt: -1 },
      oldest:       { createdAt: 1 },
      "price-asc":  { price: 1 },
      "price-desc": { price: -1 },
      popular:      { salesCount: -1 },
    };

    const projection = "name price comparePrice category images stock status salesCount createdAt";
    const sortQuery = sortMap[sort] ?? sortMap.newest;

    let products: any[];
    let total: number;

    if (search) {
      // Stem-based search: tokenise + stem the query, match across name/description/category
      // "shoes" → stem "shoe" → matches "Running Sneakers", "Shoe Rack" etc.
      const stemFilter = buildStemFilter(search, baseFilter);
      [products, total] = await Promise.all([
        Product.find(stemFilter).select(projection).sort(sortQuery).skip(skip).limit(limit).lean(),
        Product.countDocuments(stemFilter),
      ]);
    } else {
      [products, total] = await Promise.all([
        Product.find(baseFilter).select(projection).sort(sortQuery).skip(skip).limit(limit).lean(),
        Product.countDocuments(baseFilter),
      ]);
    }

    res.status(200).json({
      data: await enrichWithActiveOffers(products),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  }
};

/**
 * GET /api/v1/products/:id
 * Public — full product details
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, status: "active" })
      .populate("createdBy", "storeName name")
      .lean() as any;

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const seller = product.createdBy as any;
    const sellerName: string | null = seller?.storeName || null;

    const [enriched] = await enrichWithActiveOffers([{ ...product }]);
    res.status(200).json({ ...enriched, sellerName });
  } catch (error: any) {
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  }
};

/**
 * GET /api/v1/categories
 * Public — returns all categories (cached in Redis)
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const cached = await cacheGet<any[]>("storefront:categories");
    if (cached) return res.status(200).json(cached);

    const categories = await Category.find().select("name description").sort({ name: 1 }).lean();
    await cacheSet("storefront:categories", categories, CACHE_TTL.CATEGORIES);
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message });
  }
};
