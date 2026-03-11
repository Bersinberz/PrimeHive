import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
    // General
    storeName: string;
    supportEmail: string;
    currency: string;
    timezone: string;
    orderIdPrefix: string;

    // Shipping & Taxes
    standardShippingRate: number;
    freeShippingThreshold: number;
    taxRate: number;
    taxInclusive: boolean;
}

const settingsSchema = new Schema<ISettings>(
    {
        // ── General ──
        storeName: {
            type: String,
            default: "PrimeHive",
            trim: true,
            maxlength: 100,
        },
        supportEmail: {
            type: String,
            default: "support@primehive.com",
            trim: true,
            lowercase: true,
            maxlength: 150,
        },
        currency: {
            type: String,
            default: "INR",
            enum: ["INR"],
        },
        timezone: {
            type: String,
            default: "Asia/Kolkata",
            enum: ["Asia/Kolkata"],
        },
        orderIdPrefix: {
            type: String,
            default: "ORD-",
            trim: true,
            maxlength: 10,
        },

        // ── Shipping & Taxes ──
        standardShippingRate: {
            type: Number,
            default: 50,
            min: 0,
        },
        freeShippingThreshold: {
            type: Number,
            default: 999,
            min: 0,
        },
        taxRate: {
            type: Number,
            default: 18,
            min: 0,
            max: 100,
        },
        taxInclusive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Singleton pattern: always use the first document
settingsSchema.statics.getInstance = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

const Settings = mongoose.model<ISettings>("Settings", settingsSchema);

export default Settings;
