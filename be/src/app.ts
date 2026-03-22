import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import passport from "passport";
import authRouter from "./routes/auth.router";
import productRouter from "./routes/product.router";
import cartRouter from "./routes/cart.router";
import otpRouter from "./routes/otp.router";
import paymentController from "./controllers/payment.controller";
import paymentReturnRouter from "./routes/payment_return.router";
import routeValidation from "./middlewares/resource.middleware";
import errorHandler from "./middlewares/error.middleware";
import orderRouter from "routes/order.router";
import paymentRouter from "routes/payment.router";
import wishlistRouter from "./routes/wishlist.router";
import cardRouter from "./routes/card.router";
import addressRouter from "./routes/address.router";
import shopAddressRouter from "./routes/shop_address.router";
import profileRouter from "./routes/profile.router";
import categoryRouter from "./routes/category.router";
import adminRouter from "./routes/admin.router";
import uploadRouter from "./routes/upload.router";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";
import { ensureUploadDirectories, uploadRootDir } from "./config/upload.config";

export const createApp = () => {
  const app = express();
  ensureUploadDirectories();

  app.use(cors());
  app.post(
    "/api/v1/payments/webhook",
    express.raw({ type: "application/json" }),
    paymentController.stripeWebhook
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(passport.initialize());
  app.use("/uploads", express.static(path.resolve(uploadRootDir)));

  // Swagger UI (before routeValidation so it's not blocked)
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-doc", (req, res) => {
    res.redirect(302, "/api-docs");
  });
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  app.get("/api-doc.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.use(paymentReturnRouter);
  app.use(routeValidation);

  // Health check - responds immediately without waiting for DB
  app.get("/", (req, res) => {
    res.status(200).json({
      status: "ok",
      message: "The Fashion App Backend is running!",
      timestamp: new Date().toISOString(),
    });
  });

  // Routes
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1", productRouter);
  app.use("/api/v1", cartRouter);
  app.use("/api/v1", otpRouter);
  app.use("/api/v1", orderRouter);
  app.use("/api/v1", paymentRouter);
  app.use("/api/v1", cardRouter);
  app.use("/api/v1", addressRouter);
  app.use("/api/v1", shopAddressRouter);
  app.use("/api/v1", profileRouter);
  app.use("/api/v1", categoryRouter);
  app.use("/api/v1", uploadRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/wishlist", wishlistRouter);

  // Ensure unknown API routes return JSON instead of HTML.
  app.use("/api/v1", (req, res) => {
    res.status(404).json({
      status: "error",
      statusCode: 404,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};

export default createApp();
