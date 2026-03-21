import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../../models/Order";
import Product from "../../models/Product";
import User from "../../models/User";
import { redisGet, redisSet } from "../../config/redis";

const CACHE_TTL = 2 * 60; // 2 minutes

/** Fill missing days for the last 7 days */
const fillDays = (revenueByDay: any[], ordersPerDay: any[]) => {
    const now = new Date();
    const dayLabels: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        dayLabels.push(d.toISOString().split("T")[0]);
    }

    const revenueMap = new Map(revenueByDay.map((r: any) => [r._id, r]));
    const ordersMap = new Map(ordersPerDay.map((r: any) => [r._id, r.count]));

    return {
        filledRevenueByDay: dayLabels.map((date) => {
            const entry = revenueMap.get(date);
            return { date, revenue: entry?.revenue ?? 0, orders: entry?.orders ?? 0 };
        }),
        filledOrdersPerDay: dayLabels.map((date) => ({
            day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
            date,
            count: ordersMap.get(date) ?? 0,
        })),
    };
};

/** Superadmin: store-wide stats */
const getSuperadminStats = async () => {
    const CACHE_KEY = "dashboard:stats";
    const cached = await redisGet(CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [
        totalRevenue, totalOrders, totalCustomers, totalProducts,
        recentOrders, lowStockProducts, revenueByDay, ordersByStatus,
        topProductsAgg, ordersPerDay,
    ] = await Promise.all([
        Order.aggregate([
            { $match: { status: { $nin: ["Cancelled", "Refunded"] } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.countDocuments(),
        User.countDocuments({ role: "user" }),
        Product.countDocuments(),
        Order.find()
            .sort({ createdAt: -1 }).limit(5)
            .populate("customer", "name email")
            .select("orderId customer totalAmount status createdAt"),
        Product.find({ stock: { $lt: 15 } })
            .sort({ stock: 1 }).limit(10)
            .select("name sku stock"),
        Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $nin: ["Cancelled", "Refunded"] } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        Order.aggregate([
            { $match: { status: { $nin: ["Cancelled", "Refunded"] } } },
            { $unwind: "$items" },
            { $group: { _id: "$items.name", sold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
            { $sort: { revenue: -1 } }, { $limit: 5 },
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
    ]);

    const { filledRevenueByDay, filledOrdersPerDay } = fillDays(revenueByDay, ordersPerDay);

    const data = {
        totalRevenue: totalRevenue[0]?.total ?? 0,
        totalOrders,
        totalCustomers,
        totalProducts,
        recentOrders,
        lowStockProducts: lowStockProducts.map((p: any) => ({
            product: p.name, sku: p.sku || "N/A", stock: p.stock,
            status: p.stock < 5 ? "Critical" : "Low",
        })),
        revenueByDay: filledRevenueByDay,
        ordersByStatus: ordersByStatus.map((s: any) => ({ status: s._id, count: s.count })),
        topProducts: topProductsAgg.map((p: any) => ({ name: p._id, sold: p.sold, revenue: p.revenue })),
        ordersPerDay: filledOrdersPerDay,
    };

    await redisSet(CACHE_KEY, JSON.stringify(data), CACHE_TTL);
    return data;
};

/** Staff: scoped stats — only products/orders belonging to this staff member */
const getStaffStats = async (staffId: string) => {
    const CACHE_KEY = `dashboard:stats:${staffId}`;
    const cached = await redisGet(CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const staffObjId = new mongoose.Types.ObjectId(staffId);

    // Step 1: get this staff member's product IDs
    const staffProducts = await Product.find({ createdBy: staffObjId }).select("_id").lean();
    const staffProductIds = staffProducts.map((p) => p._id);

    // If staff has no products yet, return zeroed-out stats
    if (staffProductIds.length === 0) {
        return {
            totalRevenue: 0, totalOrders: 0, totalCustomers: 0,
            totalProducts: 0, recentOrders: [], lowStockProducts: [],
            revenueByDay: [], ordersByStatus: [], topProducts: [], ordersPerDay: [],
        };
    }

    const itemsMatch = { "items.product": { $in: staffProductIds } };
    const itemsMatchNonCancelled = {
        "items.product": { $in: staffProductIds },
        status: { $nin: ["Cancelled", "Refunded"] },
    };

    const [
        revenueAgg, totalOrders, totalProducts,
        recentOrders, lowStockProducts,
        revenueByDay, ordersByStatus, topProductsAgg, ordersPerDay,
    ] = await Promise.all([
        // Revenue: sum only the staff's items across all orders
        Order.aggregate([
            { $match: { ...itemsMatchNonCancelled } },
            { $unwind: "$items" },
            { $match: { "items.product": { $in: staffProductIds } } },
            { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        ]),
        // Orders: count distinct orders containing staff products
        Order.countDocuments(itemsMatch),
        // Products: count staff's own products
        Product.countDocuments({ createdBy: staffObjId }),
        // Recent orders containing staff products
        Order.find(itemsMatch)
            .sort({ createdAt: -1 }).limit(5)
            .populate("customer", "name email")
            .select("orderId customer totalAmount status createdAt"),
        // Low stock: only staff's products
        Product.find({ createdBy: staffObjId, stock: { $lt: 15 } })
            .sort({ stock: 1 }).limit(10)
            .select("name sku stock"),
        // Revenue by day (last 7 days) — scoped to staff items
        Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, ...itemsMatchNonCancelled } },
            { $unwind: "$items" },
            { $match: { "items.product": { $in: staffProductIds } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        // Orders by status — scoped
        Order.aggregate([
            { $match: itemsMatch },
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        // Top products — scoped to staff's products
        Order.aggregate([
            { $match: itemsMatchNonCancelled },
            { $unwind: "$items" },
            { $match: { "items.product": { $in: staffProductIds } } },
            {
                $group: {
                    _id: "$items.name",
                    sold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                },
            },
            { $sort: { revenue: -1 } }, { $limit: 5 },
        ]),
        // Orders per day (last 7 days) — scoped
        Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, ...itemsMatch } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
    ]);

    const { filledRevenueByDay, filledOrdersPerDay } = fillDays(revenueByDay, ordersPerDay);

    const data = {
        totalRevenue: revenueAgg[0]?.total ?? 0,
        totalOrders,
        totalCustomers: 0, // not applicable for staff
        totalProducts,
        recentOrders,
        lowStockProducts: lowStockProducts.map((p: any) => ({
            product: p.name, sku: p.sku || "N/A", stock: p.stock,
            status: p.stock < 5 ? "Critical" : "Low",
        })),
        revenueByDay: filledRevenueByDay,
        ordersByStatus: ordersByStatus.map((s: any) => ({ status: s._id, count: s.count })),
        topProducts: topProductsAgg.map((p: any) => ({ name: p._id, sold: p.sold, revenue: p.revenue })),
        ordersPerDay: filledOrdersPerDay,
    };

    await redisSet(CACHE_KEY, JSON.stringify(data), CACHE_TTL);
    return data;
};

/** Main controller — branches by role */
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const role = req.user!.role;
        const data = role === "superadmin"
            ? await getSuperadminStats()
            : await getStaffStats(req.user!.id);

        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
        });
    }
};
