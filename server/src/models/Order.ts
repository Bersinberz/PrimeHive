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
    timeline: ITimelineEvent[];
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
    },
    { timestamps: true }
);

// Auto-generate orderId using atomic counter (race-condition safe)
OrderSchema.pre("save", async function () {
    if (this.isNew && !this.orderId) {
        const seq = await getNextSequence("orderId");
        this.orderId = `ORD-${seq}`;
    }
});

export default mongoose.model<IOrder>("Order", OrderSchema);
