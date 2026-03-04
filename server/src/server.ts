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
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import adminProductRoutes from "./routes/Admin/adminProductRoutes";

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

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: process.env.CLIENT_URL,
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

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later."
  })
);

// ==========================================
// Routes
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/admin/products", adminProductRoutes);

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

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// ==========================================
// Global Error Handler (#14)
// ==========================================

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Error:", err);
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
      console.log(`
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
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error: any) {
    console.error(`
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