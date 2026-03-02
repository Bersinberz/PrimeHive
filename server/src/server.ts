import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";

// ==========================================
// Load Environment Variables
// ==========================================

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`
});

const app = express();
const PORT = process.env.PORT;

// ==========================================
// Global Middlewares
// ==========================================

app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later."
  })
);

app.use("/api/auth", authRoutes);

// ==========================================
// Health Route
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

// ==========================================
// 404 Handler
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// ==========================================
// Start Server AFTER DB Connects
// ==========================================

const startServer = async () => {
  try {
    console.log("==================================");
    console.log("🚀 Starting PrimeHive Server...");
    console.log("==================================");

    // Connect MongoDB first
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log("==================================");
      console.log(`🖥 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log("==================================");
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("Server closed.");
      });
    });

  } catch (error) {
    console.error("==================================");
    console.error("❌ Server failed to start");
    console.error(error);
    console.error("==================================");
    process.exit(1);
  }
};

startServer();