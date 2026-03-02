import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not defined in environment variables");
    }

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("==================================");
    console.log("🗄 MongoDB Connected Successfully");
    console.log(`📂 Database: ${conn.connection.name}`);
    console.log("==================================");

  } catch (error: any) {
    console.error("==================================");
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);
    console.error("==================================");
    throw error;
  }
};