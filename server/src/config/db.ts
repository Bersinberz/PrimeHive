import mongoose from "mongoose";

export const connectDB = async (): Promise<string> => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not defined in environment variables");
  }

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(process.env.MONGO_URI);

  return conn.connection.name;
};