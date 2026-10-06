import express from "express";
import "express-async-errors";
import fs from "fs";
import path from "path";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB, isDbConnected } from "./src/server/db";
import { authMiddleware, clients } from "./src/server/middleware/auth";
import { generalApiLimiter } from "./src/server/middleware/rateLimiter";
import { errorHandler } from "./src/server/middleware/errorHandler";
import { authRouter } from "./src/server/routes/auth";
import { wargaRouter } from "./src/server/routes/warga";
import { dataRouter } from "./src/server/routes/data";
import { votingRouter } from "./src/server/routes/voting";
import { dashboardRouter } from "./src/server/routes/dashboard";
import { aiRouter } from "./src/server/routes/ai";
import { adminRouter } from "./src/server/routes/admin";
import { initDb } from "./src/server/initDb";

dotenv.config();

export const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 3000;

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://upload.wikimedia.org", "https://*.wikimedia.org"],
        connectSrc: ["'self'", "https:", "wss:", "ws:"],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// Payload size limits to prevent DoS
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Global DB connection middleware for APIs
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    try {
      await connectDB();
    } catch {
      return res.status(500).json({ error: { code: "DATABASE_ERROR", message: "Gagal menghubungkan ke database." } });
    }
  }
  next();
});

// General rate limiter on all API endpoints
app.use("/api/", generalApiLimiter);

// Public stream endpoint for SSE live updates
app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.add(res);
  req.on("close", () => {
    clients.delete(res);
  });
});

// Tangerang logo proxy endpoint
app.get("/api/tangerang-logo-proxy", async (_req, res) => {
  try {
    const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Seal_of_Tangerang_Regency.svg/500px-Seal_of_Tangerang_Regency.svg.png";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch logo");
    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=604800");
    return res.send(Buffer.from(arrayBuffer));
  } catch {
    const transparentPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    res.setHeader("Content-Type", "image/png");
    return res.send(Buffer.from(transparentPngBase64, "base64"));
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", mode: "modular-tables", isDbConnected });
});

// Authentication middleware applied to all protected /api routes
app.use(authMiddleware);

// Mount modular sub-routers
app.use("/api", authRouter);
app.use("/api", wargaRouter);
app.use("/api", dataRouter);
app.use("/api", votingRouter);
app.use("/api", dashboardRouter);
app.use("/api", aiRouter);
app.use("/api", adminRouter);

// Centralized Express Error Handler
app.use(errorHandler);

// API 404 handler
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: `Endpoint ${req.originalUrl} tidak ditemukan` } });
});

export async function startServer(listen = true) {
  const distPath = path.join(process.cwd(), "dist");
  const distIndex = path.join(distPath, "index.html");
  const isDevCommand = process.env.npm_lifecycle_event === "dev";
  const isProduction =
    !isDevCommand &&
    (process.env.NODE_ENV === "production" ||
      process.env.npm_lifecycle_event === "start" ||
      Boolean(process.env.VERCEL)) &&
    fs.existsSync(distIndex);

  if (!isProduction) {
    const viteDynamic = "vite";
    const viteModule = await import(viteDynamic);
    const vite = await viteModule.createServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
      } else {
        res.sendFile(path.join(process.cwd(), "index.html"));
      }
    });
  }

  if (listen) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server launched successfully on port ${PORT}`);
    });
  }

  (async () => {
    try {
      await connectDB();
      if (!process.env.VERCEL) {
        await initDb("rt01");
        await initDb("rt02");
        await initDb("rt03");
      }
    } catch (err) {
      console.error("Background DB initialization warning:", err);
    }
  })();
}

if (!process.env.VERCEL) {
  startServer(true);
}

export default app;
