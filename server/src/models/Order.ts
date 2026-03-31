import mongoose, { Schema, Document } from "mongoose";
import { getNextSequence } from "./Counter";

export type OrderStatus =
    | "Pending"
    | "Paid"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Refunded";

export type RefundStatus = "none" | "pending_refund" | "refunded" | "rejected";

export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface ITimelineEvent {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
}

export interface IShippingAddress {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface IOrder extends Document {
    orderId: string;
    customer?: mongoose.Types.ObjectId;
    guestEmail?: string;
    items: IOrderItem[];
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: IShippingAddress;
    status: OrderStatus;
    refundStatus: RefundStatus;
    refundReason?: string;
    timeline: ITimelineEvent[];
    couponCode?: string;
    couponDiscount?: number;
    deliveryPartnerId?: mongoose.Types.ObjectId;
    deliveryStatus?: "not_assigned" | "assigned" | "picked_up" | "out_for_delivery" | "delivered";
    proofOfDelivery?: string;
    deliveryOtp?: string;
    deliveryOtpExpires?: Date;
    deliveryOtpVerified?: boolean;
    assignedAt?: Date;
    pendingCouponId?: string;
    returnDeliveryPartnerId?: mongoose.Types.ObjectId;
    returnPickupStatus?: "assigned" | "pickup_accepted" | "picked_up" | "returned_to_store";
    returnAssignedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
    {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, default: "" },
    },
    { _id: false }
);

const TimelineEventSchema = new Schema<ITimelineEvent>(
    {
        status: {
            type: String,
            enum: ["Pending", "Paid", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"],
            required: true,
        },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
    },
    { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
    {
        line1: { type: String, required: true },
        line2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true, default: "India" },
    },
    { _id: false }
);

const OrderSchema = new Schema<IOrder>(
    {
        orderId: {
            type: String,
            unique: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        guestEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
        items: {
            type: [OrderItemSchema],
            validate: {
                validator: (v: IOrderItem[]) => v.length > 0,
                message: "At least one item is required",
            },
        },
        totalAmount: {
            type: Number,
            required: [true, "Total amount is required"],
            min: [0, "Total cannot be negative"],
        },
        paymentMethod: {
            type: String,
            required: [true, "Payment method is required"],
            trim: true,
        },
        shippingAddress: {
            type: ShippingAddressSchema,
            required: [true, "Shipping address is required"],
        },
        status: {
            type: String,
            enum: ["Pending", "Paid", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"],
            default: "Pending",
        },
        timeline: {
            type: [TimelineEventSchema],
            default: [],
        },
        couponCode: { type: String },
        couponDiscount: { type: Number, min: 0 },
        deliveryPartnerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
        deliveryStatus: {
            type: String,
            enum: ["not_assigned", "assigned", "picked_up", "out_for_delivery", "delivered"],
            default: "not_assigned",
        },
        proofOfDelivery: { type: String, default: null },
        deliveryOtp: { type: String, default: null },
        deliveryOtpExpires: { type: Date, default: null },
        deliveryOtpVerified: { type: Boolean, default: false },
        assignedAt: { type: Date, default: null },
        pendingCouponId: { type: String, default: null },
        returnDeliveryPartnerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
        returnPickupStatus: { type: String, enum: ["assigned", "pickup_accepted", "picked_up", "returned_to_store"], default: null },
        returnAssignedAt: { type: Date, default: null },
        refundStatus: {
            type: String,
            enum: ["none", "pending_refund", "refunded", "rejected"],
            default: "none",
        },
        refundReason: { type: String, trim: true, maxlength: 1000 },
    },
    { timestamps: true }
);

// Indexes — orderId unique index is already created by `unique: true` on the field
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ guestEmail: 1 });

// Auto-generate orderId using atomic counter (race-condition safe)
OrderSchema.pre("save", async function () {
    if (this.isNew && !this.orderId) {
        const seq = await getNextSequence("orderId");
        this.orderId = `ORD-${seq}`;
    }
});

export default mongoose.model<IOrder>("Order", OrderSchema);
