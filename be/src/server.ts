import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import authRouter from "./routes/auth.router";
import databaseConfig from "./config/database.config";
import paymentController from "./controllers/payment.controller";
import paymentReturnRouter from "./routes/payment_return.router";
import errorHandler from "./middlewares/error.middleware";
import routeValidation from "./middlewares/resource.middleware";
import redis from "ioredis";
import otpRouter from "./routes/otp.router";
import passport from "passport";
import "@lib/auth_passport/facebook";
import "@lib/auth_passport/gmail";
import wishlistRouter from "./routes/wishlist.router";
import productRouter from "./routes/product.router";
import cartRouter from "./routes/cart.router";
import orderRouter from "./routes/order.router";
import paymentRouter from "./routes/payment.router";
import cardRouter from "./routes/card.router";
import addressRouter from "./routes/address.router";
import shopAddressRouter from "./routes/shop_address.router";
import profileRouter from "./routes/profile.router";
import categoryRouter from "./routes/category.router";
import adminRouter from "./routes/admin.router";
import uploadRouter from "./routes/upload.router";
import http from "http";
import { initWS } from "./config/websocket.config";
import { ensureUploadDirectories, uploadRootDir } from "./config/upload.config";

databaseConfig.connectDB().then(() => {
  const app = express();
  const server = initWS(http.createServer(app));
  ensureUploadDirectories();

  // mounting express plugin
  app.use(cors());
  app.post(
    "/api/v1/payments/webhook",
    express.raw({ type: "application/json" }),
    paymentController.stripeWebhook
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // mounting passport
  app.use(passport.initialize());
  app.use("/uploads", express.static(path.resolve(uploadRootDir)));

  const redisHost = process.env.REDIS_HOST?.trim();
  const redisPort = Number(process.env.REDIS_PORT);

  if (redisHost && Number.isFinite(redisPort) && redisPort > 0) {
    const redisClient = new redis({
      host: redisHost,
      port: redisPort,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on("error", (err) => {
      console.warn("Redis connection error (non-critical):", err.message);
    });
  }

  // mounting secure route middleware
  app.use(paymentReturnRouter);
  app.use(routeValidation);

  app.get("/", (req, res) => {
    res.status(200).json({
      status: "ok",
      message: "The Fashion App Backend is running!",
      timestamp: new Date().toISOString(),
    });
  });

  // mounting routes
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1", otpRouter);
  app.use("/api/v1/wishlist", wishlistRouter);
  app.use("/api/v1", productRouter);
  app.use("/api/v1", cartRouter);
  app.use("/api/v1", orderRouter);
  app.use("/api/v1", paymentRouter);
  app.use("/api/v1", cardRouter);
  app.use("/api/v1", addressRouter);
  app.use("/api/v1", shopAddressRouter);
  app.use("/api/v1", profileRouter);
  app.use("/api/v1", categoryRouter);
  app.use("/api/v1", uploadRouter);
  app.use("/api/v1/admin", adminRouter);

  // Ensure unknown API routes return JSON instead of Express HTML pages.
  app.use("/api/v1", (req, res) => {
    res.status(404).json({
      status: "error",
      statusCode: 404,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // mounting global error handler
  app.use(errorHandler);

  server.listen(Number(process.env.PORT) || 3000, () =>
    console.log(`Server is running on port ${Number(process.env.PORT) || 3000}`),
  );
});
