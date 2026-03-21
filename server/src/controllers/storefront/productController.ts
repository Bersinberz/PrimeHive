import { Request, Response } from "express";
import Product from "../../models/Product";
import Category from "../../models/Category";
import { redisGet, redisSet } from "../../config/redis";
import { escapeRegex } from "../../utils/escapeRegex";

const CATEGORIES_CACHE_KEY = "storefront:categories";
const CATEGORIES_TTL = 5 * 60; // 5 minutes

/**
 * GET /api/v1/products
 * Public — returns only active products with pagination, search, filtering, sorting
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

    // Always filter to active only
    const filter: Record<string, unknown> = { status: "active" };

    if (search) {
      const safe = escapeRegex(search);
      filter.$or = [
        { name: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = { $regex: new RegExp(`^${escapeRegex(category)}$`, "i") };
    }

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      const priceFilter: Record<string, number> = {};
      if (!isNaN(minPrice)) priceFilter.$gte = minPrice;
      if (!isNaN(maxPrice)) priceFilter.$lte = maxPrice;
      filter.price = priceFilter;
    }

    // Sort options
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.newest;

    const projection = "name price comparePrice category images stock status createdAt";

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select(projection)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      data: products,
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
    const product = await Product.findOne({
      _id: req.params.id,
      status: "active",
    })
      .populate("createdBy", "storeName name")
      .lean() as any;

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Attach sellerName: only show if the seller has set a storeName
    const seller = product.createdBy as any;
    const sellerName: string | null = seller?.storeName || null;

    res.status(200).json({ ...product, sellerName });
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
    const cached = await redisGet(CATEGORIES_CACHE_KEY);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const categories = await Category.find()
      .select("name description")
      .sort({ name: 1 })
      .lean();

    await redisSet(CATEGORIES_CACHE_KEY, JSON.stringify(categories), CATEGORIES_TTL);

    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  }
};
