"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const category_1 = __importDefault(require("../models/category"));
const orders_1 = __importDefault(require("../models/orders"));
const payment_1 = __importDefault(require("../models/payment"));
const product_1 = __importDefault(require("../models/product"));
const user_1 = __importDefault(require("../models/user"));
const mongoose_1 = __importDefault(require("mongoose"));
const notFound_exception_1 = __importDefault(require("../exceptions/notFound.exception"));
const badRequest_exception_1 = __importDefault(require("../exceptions/badRequest.exception"));
const stripe_config_1 = require("../config/stripe.config");
const order_service_impl_1 = __importDefault(require("../services/impl/order.service.impl"));
const payment_service_impl_1 = __importDefault(require("../services/impl/payment.service.impl"));
const ZERO_DECIMAL_CURRENCIES = new Set([
    "bif",
    "clp",
    "djf",
    "gnf",
    "jpy",
    "kmf",
    "krw",
    "mga",
    "pyg",
    "rwf",
    "ugx",
    "vnd",
    "vuv",
    "xaf",
    "xof",
    "xpf",
]);
function addressToString(value) {
    if (!value || typeof value !== "object") {
        return "Address unavailable";
    }
    return [value.street, value.city, value.state, value.postalCode, value.country]
        .filter((part) => typeof part === "string" && part.trim())
        .join(", ");
}
function mapOrderStatus(value) {
    return typeof value === "string" ? value : "pending";
}
function mapPaymentStatus(value) {
    if (value === "completed")
        return "COMPLETED";
    if (value === "failed")
        return "FAILED";
    return value || "PENDING";
}
function normalizeStripeAmount(amount, currency) {
    const normalizedCurrency = String(currency || "").toLowerCase();
    if (ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)) {
        return amount;
    }
    return amount / 100;
}
function mapStripeBalanceAmounts(entries = []) {
    return entries.map((entry) => ({
        currency: String(entry.currency || "").toUpperCase(),
        amount: Number(entry.amount || 0),
        displayAmount: normalizeStripeAmount(Number(entry.amount || 0), String(entry.currency || "")),
        sourceTypes: entry.source_types || {},
    }));
}
class AdminController {
    constructor() {
        this.productModel = product_1.default.getModel();
        this.orderModel = orders_1.default.getModel();
        this.paymentModel = payment_1.default.getModel();
        this.userModel = user_1.default.getModel();
        this.categoryModel = category_1.default.getModel();
        this.dashboard = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const [productCount, orderCount, customerCount, categoryCount, paymentStats, recentOrders, lowStockProducts, stripeBalance] = yield Promise.all([
                this.productModel.countDocuments(),
                this.orderModel.countDocuments(),
                this.userModel.countDocuments({ role: "user" }),
                this.categoryModel.countDocuments(),
                this.paymentModel.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalSales: {
                                $sum: {
                                    $cond: [
                                        { $in: ["$status", ["COMPLETED", "SUCCEEDED", "REFUNDED"]] },
                                        "$amount",
                                        0,
                                    ],
                                },
                            },
                            pendingPayments: {
                                $sum: {
                                    $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0],
                                },
                            },
                        },
                    },
                ]),
                this.orderModel.find().sort({ createdAt: -1 }).limit(5).lean(),
                this.productModel.find().sort({ updatedAt: -1 }).limit(20).lean(),
                this.getStripeBalanceSummary(),
            ]);
            const lowStock = lowStockProducts
                .map((product) => {
                const stock = Array.isArray(product.variants)
                    ? product.variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0)
                    : 0;
                return {
                    id: product._id.toString(),
                    name: product.name,
                    category: product.category,
                    stock,
                    updatedAt: product.updatedAt,
                };
            })
                .filter((product) => product.stock <= 10)
                .sort((a, b) => a.stock - b.stock)
                .slice(0, 5);
            res.status(200).json({
                success: true,
                message: "Admin dashboard summary fetched successfully.",
                data: {
                    summary: {
                        totalSales: ((_a = paymentStats[0]) === null || _a === void 0 ? void 0 : _a.totalSales) || 0,
                        totalOrders: orderCount,
                        totalCustomers: customerCount,
                        totalProducts: productCount,
                        totalCategories: categoryCount,
                        pendingPayments: ((_b = paymentStats[0]) === null || _b === void 0 ? void 0 : _b.pendingPayments) || 0,
                        lowStockProducts: lowStock.length,
                    },
                    stripeBalance,
                    recentOrders: recentOrders.map((order) => {
                        var _a, _b, _c;
                        return ({
                            id: order._id.toString(),
                            orderNumber: order.orderNumber,
                            userId: ((_b = (_a = order.userId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || "",
                            totalAmount: order.totalAmount,
                            orderStatus: order.orderStatus,
                            paymentStatus: order.paymentStatus,
                            deliveryStatus: ((_c = order.delivery) === null || _c === void 0 ? void 0 : _c.deliveryStatus) || "preparing",
                            createdAt: order.createdAt,
                            itemsCount: Array.isArray(order.items) ? order.items.length : 0,
                        });
                    }),
                    lowStockProducts: lowStock,
                },
            });
        });
        this.customers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(Number(req.query.page) || 1, 1);
            const limit = Math.max(Number(req.query.limit) || 20, 1);
            const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
            const status = typeof req.query.status === "string" ? req.query.status.trim() : "";
            const query = { role: "user" };
            if (status === "active" || status === "banned") {
                query.status = status;
            }
            if (search) {
                query.$or = [
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phoneNumber: { $regex: search, $options: "i" } },
                ];
            }
            const [users, total] = yield Promise.all([
                this.userModel.aggregate([
                    { $match: query },
                    {
                        $lookup: {
                            from: "orders",
                            localField: "_id",
                            foreignField: "userId",
                            as: "orders",
                        },
                    },
                    {
                        $addFields: {
                            totalOrders: { $size: "$orders" },
                            paidOrders: {
                                $filter: {
                                    input: "$orders",
                                    as: "order",
                                    cond: { $eq: ["$$order.paymentStatus", "completed"] },
                                },
                            },
                        },
                    },
                    {
                        $addFields: {
                            totalSpent: { $sum: "$paidOrders.totalAmount" },
                        },
                    },
                    { $sort: { totalSpent: -1, totalOrders: -1, createdAt: -1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                    {
                        $project: {
                            fullName: 1,
                            email: 1,
                            phoneNumber: 1,
                            status: 1,
                            createdAt: 1,
                            addresses: 1,
                            totalOrders: 1,
                            totalSpent: 1,
                        },
                    },
                ]),
                this.userModel.countDocuments(query),
            ]);
            res.status(200).json({
                success: true,
                message: "Admin customers fetched successfully.",
                data: users.map((user) => {
                    const primaryAddress = Array.isArray(user.addresses)
                        ? user.addresses.find((address) => address === null || address === void 0 ? void 0 : address.isDefault) || user.addresses[0]
                        : null;
                    return {
                        id: user._id.toString(),
                        name: user.fullName,
                        email: user.email,
                        phone: user.phoneNumber || "",
                        address: addressToString(primaryAddress),
                        totalOrders: Number(user.totalOrders || 0),
                        totalSpent: Number(user.totalSpent || 0),
                        status: user.status,
                        joinedAt: user.createdAt,
                    };
                }),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            });
        });
        this.customerById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = this.getParamId(req);
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new badRequest_exception_1.default("Invalid customer id.");
            }
            const user = yield this.userModel.findOne({ _id: id, role: "user" }).lean();
            if (!user) {
                throw new notFound_exception_1.default("Customer not found.");
            }
            const orders = yield this.orderModel.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
            const totalSpent = orders.reduce((sum, order) => order.paymentStatus === "completed"
                ? sum + Number(order.totalAmount || 0)
                : sum, 0);
            const primaryAddress = Array.isArray(user.addresses)
                ? user.addresses.find((address) => address === null || address === void 0 ? void 0 : address.isDefault) || user.addresses[0]
                : null;
            res.status(200).json({
                success: true,
                message: "Admin customer fetched successfully.",
                data: {
                    customer: {
                        id: user._id.toString(),
                        name: user.fullName,
                        email: user.email,
                        phone: user.phoneNumber || "",
                        address: addressToString(primaryAddress),
                        totalOrders: orders.length,
                        totalSpent,
                        status: user.status,
                        joinedAt: user.createdAt,
                    },
                    orders: orders.map((order) => {
                        var _a, _b, _c;
                        return ({
                            id: order._id.toString(),
                            orderNumber: order.orderNumber,
                            totalAmount: order.totalAmount,
                            orderStatus: order.orderStatus,
                            paymentStatus: order.paymentStatus,
                            deliveryStatus: ((_a = order.delivery) === null || _a === void 0 ? void 0 : _a.deliveryStatus) || "preparing",
                            createdAt: order.createdAt,
                            shippingAddress: addressToString(((_b = order.delivery) === null || _b === void 0 ? void 0 : _b.destinationAddress) || ((_c = order.delivery) === null || _c === void 0 ? void 0 : _c.address)),
                            itemsCount: Array.isArray(order.items) ? order.items.length : 0,
                        });
                    }),
                },
            });
        });
        this.updateOrderStatus = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = this.getParamId(req);
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new badRequest_exception_1.default("Invalid order id.");
            }
            const order = yield this.orderModel.findById(id);
            if (!order) {
                throw new notFound_exception_1.default("Order not found.");
            }
            if (req.body.orderStatus) {
                order.orderStatus = mapOrderStatus(req.body.orderStatus);
            }
            if (req.body.paymentStatus) {
                order.paymentStatus = req.body.paymentStatus;
            }
            if (req.body.deliveryStatus && order.delivery) {
                order.delivery.deliveryStatus = req.body.deliveryStatus;
            }
            yield order.save();
            const enrichedOrder = yield order_service_impl_1.default.getOrderById(id);
            res.status(200).json({
                success: true,
                message: "Order status updated successfully.",
                data: enrichedOrder,
            });
        });
        this.updatePaymentStatus = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = this.getParamId(req);
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new badRequest_exception_1.default("Invalid payment id.");
            }
            const payment = yield this.paymentModel.findById(id);
            if (!payment) {
                throw new notFound_exception_1.default("Payment not found.");
            }
            const updatedPayment = yield payment_service_impl_1.default.updatePaymentStatus(id, {
                status: mapPaymentStatus(req.body.status),
                transactionRef: typeof req.body.transactionRef === "string"
                    ? req.body.transactionRef.trim()
                    : undefined,
                paidAt: req.body.paidAt ? new Date(req.body.paidAt) : undefined,
            });
            res.status(200).json({
                success: true,
                message: "Payment status updated successfully.",
                data: updatedPayment,
            });
        });
    }
    getParamId(req) {
        return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    }
    getStripeBalanceSummary() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stripe = (0, stripe_config_1.getStripeClient)();
                const balance = yield stripe.balance.retrieve();
                const available = mapStripeBalanceAmounts(balance.available);
                const pending = mapStripeBalanceAmounts(balance.pending);
                return {
                    configured: true,
                    livemode: Boolean(balance.livemode),
                    modeLabel: balance.livemode ? "Live" : "Test",
                    available,
                    pending,
                    availableTotalUsd: available
                        .filter((item) => item.currency === "USD")
                        .reduce((sum, item) => sum + item.displayAmount, 0),
                    pendingTotalUsd: pending
                        .filter((item) => item.currency === "USD")
                        .reduce((sum, item) => sum + item.displayAmount, 0),
                    retrievedAt: new Date().toISOString(),
                };
            }
            catch (error) {
                return {
                    configured: false,
                    livemode: false,
                    modeLabel: "Unavailable",
                    available: [],
                    pending: [],
                    availableTotalUsd: 0,
                    pendingTotalUsd: 0,
                    retrievedAt: new Date().toISOString(),
                    error: (error === null || error === void 0 ? void 0 : error.message) || "Unable to load Stripe balance.",
                };
            }
        });
    }
}
exports.default = new AdminController();
