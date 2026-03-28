import { Request, Response } from "express";
import Product from "../../models/Product";
import Category from "../../models/Category";
import cloudinary from "../../config/cloudinary";
import { asyncHandler } from "../../utils/asyncHandler";
import { redisDel } from "../../config/redis";

const extractPublicId = (url: string): string | null => {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    return parts[1].replace(/^v\d+\//, "").replace(/\.[^.]+$/, "");
  } catch { return null; }
};

const deleteCloudinaryImages = async (imageUrls: string[]) => {
  await Promise.allSettled(imageUrls.map(url => {
    const id = extractPublicId(url);
    return id ? cloudinary.uploader.destroy(id) : Promise.resolve();
  }));
};

const invalidateProductCache = async (id?: string) => {
  await Promise.allSettled([
    redisDel("products:list"),
    id ? redisDel(`product:${id}`) : Promise.resolve(),
  ]);
};

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, price, comparePrice, category, sku, stock, status } = req.body;
  const files = req.files as Express.Multer.File[];
  const imageUrls = files?.map((f: any) => f.path) || [];

  const product = await Product.create({
    name, description, price, comparePrice, category, sku,
    stock, status: status || "active", images: imageUrls, createdBy: req.user!.id,
  });

  if (category) await Category.findOneAndUpdate({ name: category }, { $addToSet: { products: product._id } });
  await invalidateProductCache();
  res.status(201).json(product);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
  const search = (req.query.search as string || "").trim();
  const skip   = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { sku: { $regex: search, $options: "i" } }];

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("createdBy", "name email phone storeName storeDescription storeLocation storePhone profilePicture")
      .sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({ data: products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.status(200).json(product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, price, comparePrice, category, sku, stock, status } = req.body;
  const files = req.files as Express.Multer.File[];
  const imageUrls = files?.map((f: any) => f.path) || [];

  const existing = await Product.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Product not found" });

  const updateData: Record<string, unknown> = { name, description, price, comparePrice, category, sku, stock, status };
  if (imageUrls.length > 0) {
    if (existing.images?.length) await deleteCloudinaryImages(existing.images);
    updateData.images = imageUrls;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after', runValidators: true });

  if (existing.category !== category) {
    if (existing.category) await Category.findOneAndUpdate({ name: existing.category }, { $pull: { products: existing._id } });
    if (category)          await Category.findOneAndUpdate({ name: category }, { $addToSet: { products: existing._id } });
  }

  await invalidateProductCache(req.params.id);
  res.status(200).json(product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.images?.length) await deleteCloudinaryImages(product.images);
  if (product.category) await Category.findOneAndUpdate({ name: product.category }, { $pull: { products: product._id } });
  await invalidateProductCache(req.params.id);
  res.status(200).json({ message: "Product deleted successfully" });
});

export const exportProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find().select("name description price comparePrice category sku stock status").lean();
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = "name,description,price,comparePrice,category,sku,stock,status";
  const rows = products.map(p =>
    [p.name, p.description, p.price, p.comparePrice ?? "", p.category, p.sku, p.stock, p.status].map(escape).join(",")
  );
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="products-${Date.now()}.csv"`);
  res.status(200).send([header, ...rows].join("\n"));
});

export const importProducts = asyncHandler(async (req: Request, res: Response) => {
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ message: "rows array is required" });

  const results: { row: number; success: boolean; error?: string; product?: any }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      if (!r.name?.trim())                    throw new Error("name is required");
      if (!r.price || isNaN(Number(r.price))) throw new Error("valid price is required");
      if (!r.category?.trim())                throw new Error("category is required");

      const product = await Product.create({
        name: r.name.trim(), description: r.description?.trim() || "",
        price: Number(r.price), comparePrice: r.comparePrice ? Number(r.comparePrice) : undefined,
        category: r.category.trim(), sku: r.sku?.trim() || undefined,
        stock: r.stock ? Number(r.stock) : 0, status: r.status || "active", createdBy: req.user!.id,
      });

      if (r.category) await Category.findOneAndUpdate({ name: r.category.trim() }, { $addToSet: { products: product._id } });
      results.push({ row: i + 1, success: true, product });
    } catch (err: any) {
      results.push({ row: i + 1, success: false, error: err.message });
    }
  }

  await invalidateProductCache();
  const succeeded = results.filter(r => r.success).length;
  res.status(200).json({ message: `Imported ${succeeded} products, ${results.length - succeeded} failed.`, results });
});

