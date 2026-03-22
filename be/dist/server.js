"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_router_1 = __importDefault(require("./routes/auth.router"));
const database_config_1 = __importDefault(require("./config/database.config"));
const payment_controller_1 = __importDefault(require("./controllers/payment.controller"));
const payment_return_router_1 = __importDefault(require("./routes/payment_return.router"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const resource_middleware_1 = __importDefault(require("./middlewares/resource.middleware"));
const ioredis_1 = __importDefault(require("ioredis"));
const otp_router_1 = __importDefault(require("./routes/otp.router"));
const passport_1 = __importDefault(require("passport"));
require("./lib/auth_passport/facebook");
require("./lib/auth_passport/gmail");
const wishlist_router_1 = __importDefault(require("./routes/wishlist.router"));
const product_router_1 = __importDefault(require("./routes/product.router"));
const cart_router_1 = __importDefault(require("./routes/cart.router"));
const order_router_1 = __importDefault(require("./routes/order.router"));
const payment_router_1 = __importDefault(require("./routes/payment.router"));
const card_router_1 = __importDefault(require("./routes/card.router"));
const address_router_1 = __importDefault(require("./routes/address.router"));
const shop_address_router_1 = __importDefault(require("./routes/shop_address.router"));
const profile_router_1 = __importDefault(require("./routes/profile.router"));
const category_router_1 = __importDefault(require("./routes/category.router"));
const admin_router_1 = __importDefault(require("./routes/admin.router"));
const upload_router_1 = __importDefault(require("./routes/upload.router"));
const http_1 = __importDefault(require("http"));
const websocket_config_1 = require("./config/websocket.config");
const upload_config_1 = require("./config/upload.config");
database_config_1.default.connectDB().then(() => {
    var _a;
    const app = (0, express_1.default)();
    const server = (0, websocket_config_1.initWS)(http_1.default.createServer(app));
    (0, upload_config_1.ensureUploadDirectories)();
    // mounting express plugin
    app.use((0, cors_1.default)());
    app.post("/api/v1/payments/webhook", express_1.default.raw({ type: "application/json" }), payment_controller_1.default.stripeWebhook);
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // mounting passport
    app.use(passport_1.default.initialize());
    app.use("/uploads", express_1.default.static(path_1.default.resolve(upload_config_1.uploadRootDir)));
    const redisHost = (_a = process.env.REDIS_HOST) === null || _a === void 0 ? void 0 : _a.trim();
    const redisPort = Number(process.env.REDIS_PORT);
    if (redisHost && Number.isFinite(redisPort) && redisPort > 0) {
        const redisClient = new ioredis_1.default({
            host: redisHost,
            port: redisPort,
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (times > 3)
                    return null;
                return Math.min(times * 200, 2000);
            },
        });
        redisClient.on("error", (err) => {
            console.warn("Redis connection error (non-critical):", err.message);
        });
    }
    // mounting secure route middleware
    app.use(payment_return_router_1.default);
    app.use(resource_middleware_1.default);
    app.get("/", (req, res) => {
        res.status(200).json({
            status: "ok",
            message: "The Fashion App Backend is running!",
            timestamp: new Date().toISOString(),
        });
    });
    // mounting routes
    app.use("/api/v1/auth", auth_router_1.default);
    app.use("/api/v1", otp_router_1.default);
    app.use("/api/v1/wishlist", wishlist_router_1.default);
    app.use("/api/v1", product_router_1.default);
    app.use("/api/v1", cart_router_1.default);
    app.use("/api/v1", order_router_1.default);
    app.use("/api/v1", payment_router_1.default);
    app.use("/api/v1", card_router_1.default);
    app.use("/api/v1", address_router_1.default);
    app.use("/api/v1", shop_address_router_1.default);
    app.use("/api/v1", profile_router_1.default);
    app.use("/api/v1", category_router_1.default);
    app.use("/api/v1", upload_router_1.default);
    app.use("/api/v1/admin", admin_router_1.default);
    // Ensure unknown API routes return JSON instead of Express HTML pages.
    app.use("/api/v1", (req, res) => {
        res.status(404).json({
            status: "error",
            statusCode: 404,
            message: `Route not found: ${req.method} ${req.originalUrl}`,
        });
    });
    // mounting global error handler
    app.use(error_middleware_1.default);
    server.listen(Number(process.env.PORT) || 3000, () => console.log(`Server is running on port ${Number(process.env.PORT) || 3000}`));
});
