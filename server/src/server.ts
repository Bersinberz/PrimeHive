import dotenv from "dotenv";
dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development"
});
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import logger from "./config/logger";

import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import adminProductRoutes from "./routes/Admin/adminProductRoutes";
import adminCategoryRoutes from "./routes/Admin/adminCategoryRoutes";
import adminSettingsRoutes from "./routes/Admin/adminSettingsRoutes";
import adminCustomerRoutes from "./routes/Admin/adminCustomerRoutes";
import adminStaffRoutes from "./routes/Admin/adminStaffRoutes";
import adminOrderRoutes from "./routes/Admin/adminOrderRoutes";
import adminStatsRoutes from "./routes/Admin/adminStatsRoutes";

// ==========================================
// Load Environment Variables
// ==========================================
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// NoSQL Injection Sanitizer (Express 5 compatible)
// ==========================================

const sanitize = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else {
      obj[key] = sanitize(obj[key]);
    }
  }
  return obj;
};

// ==========================================
// Global Middlewares
// ==========================================

app.use(helmet());
app.use(compression());
app.use(cookieParser());

// CORS — supports multiple origins via comma-separated CLIENT_URL (#23)
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Sanitize req.body against NoSQL injection (#24)
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitize(req.body);
  next();
});

// ==========================================
// Granular Rate Limiters (#24)
// ==========================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many auth requests. Please try again later."
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests from this IP, please try again later."
});

const statsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: "Too many dashboard requests. Please try again later."
});

import publicSettingsRoutes from "./routes/publicSettingsRoutes";

// ==========================================
// Routes (API v1) (#21)
// ==========================================

app.use("/api/v1/settings", publicSettingsRoutes);
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/admin/products", adminLimiter, adminProductRoutes);
app.use("/api/v1/admin/categories", adminLimiter, adminCategoryRoutes);
app.use("/api/v1/admin/settings", adminLimiter, adminSettingsRoutes);
app.use("/api/v1/admin/customers", adminLimiter, adminCustomerRoutes);
app.use("/api/v1/admin/staff", adminLimiter, adminStaffRoutes);
app.use("/api/v1/admin/orders", adminLimiter, adminOrderRoutes);
app.use("/api/v1/admin/stats", statsLimiter, adminStatsRoutes);

// ==========================================
// Health Route
// ==========================================

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

// ==========================================
// 404 Handler
// ==========================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// ==========================================
// Global Error Handler (#14)
// ==========================================

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled Error:", err);
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message
  });
});

// ==========================================
// Start Server AFTER DB Connects
// ==========================================

const startServer = async () => {
  try {
    const dbName = await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`
====================================================
PrimeHive Server Started Successfully
----------------------------------------------------
Server Port : ${PORT}
Environment : ${process.env.NODE_ENV}
Database    : ${dbName}
====================================================
`);
    });

    // Graceful shutdown for both SIGTERM and SIGINT (#15)
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info("Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error: any) {
    logger.error(`
====================================================
❌ PrimeHive Server Failed to Start
----------------------------------------------------
${error.message}
====================================================
`);
    process.exit(1);
  }
};

startServer();