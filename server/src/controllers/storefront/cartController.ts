import { Request, Response } from "express";
import Cart from "../../models/Cart";
import Product from "../../models/Product";
import mongoose from "mongoose";

/**
 * GET /api/v1/cart
 * Returns the logged-in user's cart
 */
export const getCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id }).lean();
    res.status(200).json(cart || { items: [] });
  } catch (error: any) {
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  }
};

/**
 * POST /api/v1/cart/sync
 * Merge guest cart (from localStorage) into user cart on login.
 * Body: { items: [{ productId, quantity }] }
 * Strategy: server wins on conflict, quantities are merged (summed, capped at stock)
 */
export const syncCart = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "items must be an array" });
    }

    if (items.length === 0) {
      const cart = await Cart.findOne({ user: req.user!.id }).lean();
      return res.status(200).json(cart || { items: [] });
    }

    // Validate product IDs
    const productIds = items
      .filter((i) => i.productId && mongoose.isValidObjectId(i.productId))
      .map((i) => i.productId);

    const products = await Product.find({
      _id: { $in: productIds },
      status: "active",
    }).select("name price images stock").lean();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) {
      cart = new Cart({ user: req.user!.id, items: [] });
    }

    // Build a map of existing cart items
    const existingMap = new Map(
      cart.items.map((item) => [item.product.toString(), item])
    );

    for (const guestItem of items) {
      if (!guestItem.productId || !mongoose.isValidObjectId(guestItem.productId)) continue;
      const product = productMap.get(guestItem.productId);
      if (!product) continue;

      const guestQty = Math.max(1, parseInt(guestItem.quantity) || 1);
      const existing = existingMap.get(guestItem.productId);

      if (existing) {
        // Merge: sum quantities, cap at stock
        existing.quantity = Math.min(existing.quantity + guestQty, product.stock);
        existing.stock = product.stock;
        existing.price = product.price; // refresh price
      } else {
        // Add new item
        cart.items.push({
          product: new mongoose.Types.ObjectId(guestItem.productId),
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          quantity: Math.min(guestQty, product.stock),
          stock: product.stock,
        });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  }
};

/**
 * POST /api/v1/cart/items
 * Add or update an item in the cart
 * Body: { productId, quantity }
 */
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const qty = Math.max(1, parseInt(quantity) || 1);

    const product = await Product.findOne({ _id: productId, status: "active" })
      .select("name price images stock")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found or unavailable" });
    }

    if (product.stock < 1) {
      return res.status(400).json({ message: "Product is out of stock" });
    }

    let cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) {
      cart = new Cart({ user: req.user!.id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qty;
      cart.items[existingIndex].quantity = Math.min(newQty, product.stock);
      cart.items[existingIndex].stock = product.stock;
    } else {
      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "",
        quantity: Math.min(qty, product.stock),
        stock: product.stock,
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  }
};

/**
 * PUT /api/v1/cart/items/:productId
 * Update quantity of a cart item
 * Body: { quantity }
 */
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    // Validate against current stock
    const product = await Product.findById(productId).select("stock").lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    cart.items[itemIndex].quantity = Math.min(qty, product.stock);
    cart.items[itemIndex].stock = product.stock;

    await cart.save();
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  }
};

/**
 * DELETE /api/v1/cart/items/:productId
 * Remove an item from the cart
 */
export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  }
};

/**
 * DELETE /api/v1/cart
 * Clear the entire cart
 */
export const clearCart = async (req: Request, res: Response) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user!.id },
      { items: [] },
      { upsert: true }
    );
    res.status(200).json({ message: "Cart cleared" });
  } catch (error: any) {
    res.status(500).json({
      message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
    });
  }
};
