import { Request, Response } from "express";
import Order from "../../models/Order";
import Product from "../../models/Product";
import User from "../../models/User";

// Simple in-memory cache for dashboard stats (2 min TTL)
let statsCache: { data: Record<string, any>; timestamp: number } | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Get Dashboard Stats — single endpoint aggregating all dashboard + analytics data
 * Results are cached in memory for 2 minutes to reduce DB load.
 */
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // Return cached data if fresh
        if (statsCache && Date.now() - statsCache.timestamp < CACHE_TTL_MS) {
            return res.status(200).json(statsCache.data);
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        // --- Run all queries in parallel ---
        const [
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalProducts,
            recentOrders,
            lowStockProducts,
            revenueByDay,
            ordersByStatus,
            topProductsAgg,
            ordersPerDay,
        ] = await Promise.all([
            // 1. Total revenue (sum of all non-cancelled/refunded orders)
            Order.aggregate([
                { $match: { status: { $nin: ["Cancelled", "Refunded"] } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),

            // 2. Total orders count
            Order.countDocuments(),

            // 3. Total customers (role = "user")
            User.countDocuments({ role: "user" }),

            // 4. Total products
            Product.countDocuments(),

            // 5. Recent 5 orders (populated)
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("customer", "name email")
                .select("orderId customer totalAmount status createdAt"),

            // 6. Low stock products (stock < 15)
            Product.find({ stock: { $lt: 15 } })
                .sort({ stock: 1 })
                .limit(10)
                .select("name sku stock"),

            // 7. Revenue per day (last 7 days)
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sevenDaysAgo },
                        status: { $nin: ["Cancelled", "Refunded"] },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                        },
                        revenue: { $sum: "$totalAmount" },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),

            // 8. Orders grouped by status
            Order.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),

            // 9. Top products by quantity sold
            Order.aggregate([
                { $match: { status: { $nin: ["Cancelled", "Refunded"] } } },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.name",
                        sold: { $sum: "$items.quantity" },
                        revenue: {
                            $sum: { $multiply: ["$items.price", "$items.quantity"] },
                        },
                    },
                },
                { $sort: { revenue: -1 } },
                { $limit: 5 },
            ]),

            // 10. Orders per day (last 7 days — all statuses)
            Order.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        // --- Fill in missing days for the last 7 days ---
        const dayLabels: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            dayLabels.push(d.toISOString().split("T")[0]);
        }

        const revenueMap = new Map(
            revenueByDay.map((r: any) => [r._id, r])
        );

        const filledRevenueByDay = dayLabels.map((date) => {
            const entry = revenueMap.get(date);
            return {
                date,
                revenue: entry ? entry.revenue : 0,
                orders: entry ? entry.orders : 0,
            };
        });

        const ordersMap = new Map(
            ordersPerDay.map((r: any) => [r._id, r.count])
        );

        const filledOrdersPerDay = dayLabels.map((date) => ({
            day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
            date,
            count: ordersMap.get(date) || 0,
        }));

        const responseData = {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalOrders,
            totalCustomers,
            totalProducts,
            recentOrders,
            lowStockProducts: lowStockProducts.map((p: any) => ({
                product: p.name,
                sku: p.sku || "N/A",
                stock: p.stock,
                status: p.stock < 5 ? "Critical" : "Low",
            })),
            revenueByDay: filledRevenueByDay,
            ordersByStatus: ordersByStatus.map((s: any) => ({
                status: s._id,
                count: s.count,
            })),
            topProducts: topProductsAgg.map((p: any) => ({
                name: p._id,
                sold: p.sold,
                revenue: p.revenue,
            })),
            ordersPerDay: filledOrdersPerDay,
        };

        // Store in cache
        statsCache = { data: responseData, timestamp: Date.now() };

        res.status(200).json(responseData);
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};
