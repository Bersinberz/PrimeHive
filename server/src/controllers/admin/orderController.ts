import { Request, Response } from "express";
import Order from "../../models/Order";
import Product from "../../models/Product";
import mongoose from "mongoose";
import { sendOrderStatusEmail } from "../../utils/sendOrderStatusEmail";

/**
 * Get All Orders (admin list view — paginated with search)
 * Superadmin: all orders
 * Staff: only orders containing products they created
 */
export const getOrders = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
        const search = (req.query.search as string || "").trim();
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (search) {
            filter.orderId = { $regex: search, $options: "i" };
        }

        // Staff: scope to orders that contain their products
        if (req.user?.role === "staff") {
            const staffProductIds = await Product.find({ createdBy: new mongoose.Types.ObjectId(req.user.id) })
                .select("_id")
                .lean()
                .then(ps => ps.map(p => p._id));

            if (staffProductIds.length === 0) {
                return res.status(200).json({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
            }
            filter["items.product"] = { $in: staffProductIds };
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("customer", "name email phone")
                .select("orderId customer items totalAmount paymentMethod status createdAt"),
            Order.countDocuments(filter),
        ]);

        res.status(200).json({
            data: orders,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error: any) {
        res.status(500).json({
            message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
        });
    }
};

/**
 * Get Single Order By ID (admin detail view)
 */
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("customer", "name email phone")
            .populate("items.product", "name images");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};

/**
 * Update Order Status
 * Body: { status: OrderStatus, note?: string }
 *
 * Side effects:
 *  - Pushes a new timeline event
 *  - If Cancelled/Refunded → restores product stock
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status, note } = req.body;

        const validStatuses = [
            "Pending", "Paid", "Processing", "Shipped",
            "Delivered", "Cancelled", "Refunded",
        ];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be one of: " + validStatuses.join(", "),
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Prevent updating status if already the same
        if (order.status === status) {
            return res.status(400).json({
                message: `Order is already "${status}".`,
            });
        }

        // Prevent updating a terminal status
        if (["Cancelled", "Refunded", "Delivered"].includes(order.status)) {
            return res.status(400).json({
                message: `Cannot change status from "${order.status}". This order is finalized.`,
            });
        }

        const previousStatus = order.status;

        // Update status & push timeline entry
        order.status = status;
        order.timeline.push({
            status,
            timestamp: new Date(),
            note: note || undefined,
        });

        await order.save();

        // Side effect: restore stock when cancelled or refunded
        if (
            (status === "Cancelled" || status === "Refunded") &&
            !["Cancelled", "Refunded"].includes(previousStatus)
        ) {
            const stockUpdates = order.items.map((item) =>
                Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity },
                })
            );
            await Promise.allSettled(stockUpdates);
        }

        // Return the updated order with populated customer
        const updatedOrder = await Order.findById(order._id)
            .populate("customer", "name email phone");

        res.status(200).json(updatedOrder);

        // Fire-and-forget: send status update email to customer
        const customerEmail =
            (updatedOrder?.customer as any)?.email || order.guestEmail;
        const customerName = (updatedOrder?.customer as any)?.name || "Customer";

        if (customerEmail) {
            sendOrderStatusEmail({
                to: customerEmail,
                customerName,
                orderId: order.orderId,
                newStatus: status,
                note: note || undefined,
            }).catch(() => { /* already logged inside */ });
        }
    } catch (error: any) {
        res.status(500).json({
            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : error.message,
        });
    }
};
