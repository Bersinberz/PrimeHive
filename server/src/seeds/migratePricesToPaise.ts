/**
 * Migration Script: Convert prices from rupees to paise (multiply by 100).
 * 
 * IMPORTANT: Back up your database before running this!
 * Run: npx ts-node src/seeds/migratePricesToPaise.ts
 * 
 * This script:
 * 1. Multiplies all Product.price by 100
 * 2. Multiplies all Product.comparePrice by 100
 * 3. Multiplies all Order.totalAmount by 100
 * 4. Multiplies all Order.items[].price by 100
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

import mongoose from "mongoose";
import { connectDB } from "../config/db";

const migrate = async () => {
    try {
        await connectDB();
        console.log("Connected to database. Starting migration...\n");

        const db = mongoose.connection.db;
        if (!db) throw new Error("Database connection not established");

        // 1. Migrate Product prices
        const productResult = await db
            .collection("products")
            .updateMany(
                { price: { $exists: true } },
                [
                    {
                        $set: {
                            price: { $multiply: ["$price", 100] },
                            comparePrice: {
                                $cond: {
                                    if: { $gt: ["$comparePrice", null] },
                                    then: { $multiply: ["$comparePrice", 100] },
                                    else: "$comparePrice",
                                },
                            },
                        },
                    },
                ]
            );
        console.log(`✅ Products migrated: ${productResult.modifiedCount}`);

        // 2. Migrate Order totalAmount and item prices
        const orderResult = await db
            .collection("orders")
            .updateMany(
                { totalAmount: { $exists: true } },
                [
                    {
                        $set: {
                            totalAmount: { $multiply: ["$totalAmount", 100] },
                            items: {
                                $map: {
                                    input: "$items",
                                    as: "item",
                                    in: {
                                        $mergeObjects: [
                                            "$$item",
                                            { price: { $multiply: ["$$item.price", 100] } },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                ]
            );
        console.log(`✅ Orders migrated: ${orderResult.modifiedCount}`);

        console.log("\n🎉 Migration complete! All prices are now in paise.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
};

migrate();
