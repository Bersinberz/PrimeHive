import dotenv from "dotenv";
dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development"
});

// Sentry must be initialized before anything else
import { initSentry, Sentry } from "./config/sentry";
initSentry();

// Validate env vars before anything else (#19)
import { validateEnv } from "./utils/envValidation";
validateEnv();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import logger from "./config/logger";
import { connectRedis, disconnectRedis } from "./config/redis";

import { errorHandler } from "./middleware/errorHandler";
import { connectDB } from "./config/db";
import { startPurgeJob } from "./jobs/purgeDeletedUsers";
import authRoutes from "./routes/authRoutes";
import adminProductRoutes from "./routes/admin/productRoutes";
import adminCategoryRoutes from "./routes/admin/categoryRoutes";
import adminSettingsRoutes from "./routes/admin/settingsRoutes";
import adminCustomerRoutes from "./routes/admin/customerRoutes";
import adminStaffRoutes from "./routes/admin/staffRoutes";
import adminOrderRoutes from "./routes/admin/orderRoutes";
import adminStatsRoutes from "./routes/admin/statsRoutes";
import storeProfileRoutes from "./routes/admin/storeProfileRoutes";
import adminOfferRoutes from "./routes/admin/offerRoutes";
import adminCouponRoutes from "./routes/admin/couponRoutes";
import adminReviewRoutes from "./routes/admin/reviewRoutes";
import adminReturnRoutes from "./routes/admin/returnRoutes";
import adminAuditLogRoutes from "./routes/admin/auditLogRoutes";
import adminStaffMgmtRoutes from "./routes/admin/adminStaffRoutes";
import adminDeliveryPartnerRoutes from "./routes/admin/deliveryPartnerRoutes";
import deliveryRoutes from "./routes/delivery/deliveryRoutes";
import publicSettingsRoutes from "./routes/publicSettingsRoutes";
import storefrontProductRoutes from "./routes/storefront/productRoutes";
import storefrontCategoryRoutes from "./routes/storefront/categoryRoutes";
import storefrontCartRoutes from "./routes/storefront/cartRoutes";
import storefrontOrderRoutes from "./routes/storefront/orderRoutes";
import storefrontReviewRoutes from "./routes/storefront/reviewRoutes";
import storefrontCouponRoutes from "./routes/storefront/couponRoutes";
import storefrontOfferRoutes from "./routes/storefront/offerRoutes";
import storefrontReturnRoutes from "./routes/storefront/returnRoutes";
import storefrontWishlistRoutes from "./routes/storefront/wishlistRoutes";
import paymentRoutes from "./routes/storefront/paymentRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// NoSQL Injection Sanitizer — body + query (#2)
// ==========================================

const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  if (typeof obj !== "object" || obj === null) return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      obj[key] = sanitizeObject(obj[key] as Record<string, unknown>);
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
// Sentry request/tracing handlers (must be before routes)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.expressErrorHandler());
}

// HTTP request logging (#16)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) }
  }));
}

// CORS
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
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

// Sanitize req.body and req.query against NoSQL injection (#2)
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) {
    // Sanitize in-place — req.query is a getter in Express 5, cannot be reassigned
    for (const key of Object.keys(req.query)) {
      const val = req.query[key];
      if (typeof val === "string" && (val.startsWith("$") || val.includes("."))) {
        delete req.query[key];
      }
    }
  }
  next();
});

// ==========================================
// Rate Limiters
// ==========================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many auth requests. Please try again later.",
  skip: (req) => {
    // Only rate-limit actual auth actions, not profile/address reads
    const strictPaths = ["/login", "/signup", "/refresh", "/set-password", "/resend-setup-email"];
    return !strictPaths.some((p) => req.path.endsWith(p));
  },
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

// ==========================================
// Routes (API v1)
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
app.use("/api/v1/admin/store-profile", adminLimiter, storeProfileRoutes);
app.use("/api/v1/admin/offers",      adminLimiter, adminOfferRoutes);
app.use("/api/v1/admin/coupons",     adminLimiter, adminCouponRoutes);
app.use("/api/v1/admin/reviews",     adminLimiter, adminReviewRoutes);
app.use("/api/v1/admin/returns",     adminLimiter, adminReturnRoutes);
app.use("/api/v1/admin/audit-logs",       adminLimiter, adminAuditLogRoutes);
app.use("/api/v1/admin/admin-staff",      adminLimiter, adminStaffMgmtRoutes);
app.use("/api/v1/admin/delivery-partners", adminLimiter, adminDeliveryPartnerRoutes);
app.use("/api/v1/delivery",               adminLimiter, deliveryRoutes);

// ==========================================
// Storefront Routes (Public + User)
// ==========================================

const storefrontLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests. Please try again later."
});

app.use("/api/v1/products", storefrontLimiter, storefrontProductRoutes);
app.use("/api/v1/categories", storefrontLimiter, storefrontCategoryRoutes);
app.use("/api/v1/cart", storefrontLimiter, storefrontCartRoutes);
app.use("/api/v1/orders",  storefrontLimiter, storefrontOrderRoutes);
app.use("/api/v1/reviews", storefrontLimiter, storefrontReviewRoutes);
app.use("/api/v1/coupons", storefrontLimiter, storefrontCouponRoutes);
app.use("/api/v1/offers",  storefrontLimiter, storefrontOfferRoutes);
app.use("/api/v1/returns",   storefrontLimiter, storefrontReturnRoutes);
app.use("/api/v1/wishlist",  storefrontLimiter, storefrontWishlistRoutes);
app.use("/api/v1/payments", storefrontLimiter, paymentRoutes);

// ==========================================
// Health Route
// ==========================================

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

// ==========================================
// 404 Handler
// ==========================================

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// ==========================================
// Global Error Handler
// ==========================================

app.use(errorHandler);

// ==========================================
// Start Server
// ==========================================

const startServer = async () => {
  try {
    // Connect Redis (non-blocking — app works without it but logs warning)
    await connectRedis();

    const dbName = await connectDB();
        startPurgeJob();

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

    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectRedis();
        logger.info("Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`
====================================================
PrimeHive Server Failed to Start
----------------------------------------------------
${msg}
====================================================
`);
    process.exit(1);
  }
};

startServer();
