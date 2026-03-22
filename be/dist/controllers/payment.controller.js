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
const payment_service_impl_1 = __importDefault(require("../services/impl/payment.service.impl"));
const stripe_1 = __importDefault(require("stripe"));
const stripe_config_1 = require("../config/stripe.config");
class PaymentController {
    constructor() {
        // Create new payment
        this.createPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const payment = yield payment_service_impl_1.default.createPayment(req.body);
                res.status(201).json({
                    success: true,
                    message: "Payment successfully",
                    data: payment,
                });
            }
            catch (error) {
                this.sendError(res, error);
            }
        });
        this.createStripeCheckoutSession = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const orderId = typeof ((_a = req.body) === null || _a === void 0 ? void 0 : _a.orderId) === "string" ? req.body.orderId.trim() : "";
                if (!orderId) {
                    res.status(400).json({
                        success: false,
                        message: "orderId is required.",
                    });
                    return;
                }
                const currentUser = req.user;
                const result = yield payment_service_impl_1.default.createStripeCheckoutSession({
                    orderId,
                    userId: (_b = currentUser === null || currentUser === void 0 ? void 0 : currentUser._id) === null || _b === void 0 ? void 0 : _b.toString(),
                });
                res.status(201).json({
                    success: true,
                    checkoutUrl: result.checkoutUrl,
                    data: result.payment,
                });
            }
            catch (error) {
                this.sendError(res, error);
            }
        });
        this.stripeWebhook = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                const signature = req.headers["stripe-signature"];
                if (typeof signature !== "string" || signature.trim().length === 0) {
                    res.status(400).json({
                        success: false,
                        message: "Missing Stripe signature.",
                    });
                    return;
                }
                const stripe = (0, stripe_config_1.getStripeClient)();
                const event = stripe.webhooks.constructEvent(req.body, signature, (0, stripe_config_1.getStripeWebhookSecret)());
                switch (event.type) {
                    case "checkout.session.completed": {
                        const session = event.data.object;
                        yield payment_service_impl_1.default.handleStripeCheckoutCompleted({
                            sessionId: session.id,
                            paymentIntentId: typeof session.payment_intent === "string"
                                ? session.payment_intent
                                : (_a = session.payment_intent) === null || _a === void 0 ? void 0 : _a.id,
                            orderId: (_c = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.orderId) !== null && _c !== void 0 ? _c : session.client_reference_id,
                        });
                        break;
                    }
                    case "checkout.session.expired": {
                        const session = event.data.object;
                        yield payment_service_impl_1.default.handleStripeCheckoutExpired({
                            sessionId: session.id,
                            orderId: (_e = (_d = session.metadata) === null || _d === void 0 ? void 0 : _d.orderId) !== null && _e !== void 0 ? _e : session.client_reference_id,
                        });
                        break;
                    }
                    case "charge.refunded": {
                        const charge = event.data.object;
                        yield payment_service_impl_1.default.handleStripeRefund({
                            paymentIntentId: typeof charge.payment_intent === "string"
                                ? charge.payment_intent
                                : (_f = charge.payment_intent) === null || _f === void 0 ? void 0 : _f.id,
                        });
                        break;
                    }
                    default:
                        break;
                }
                res.status(200).json({ received: true });
            }
            catch (error) {
                const isStripeSignatureError = error instanceof stripe_1.default.errors.StripeSignatureVerificationError;
                res.status(isStripeSignatureError ? 400 : 500).json({
                    success: false,
                    message: (error === null || error === void 0 ? void 0 : error.message) ||
                        (isStripeSignatureError
                            ? "Invalid Stripe webhook signature."
                            : "Internal Server Error"),
                });
            }
        });
        // Get payment by ID
        this.getPaymentById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.getParam(req, "paymentId");
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid payment id.",
                    });
                    return;
                }
                const payment = yield payment_service_impl_1.default.getPaymentById(id);
                if (!payment) {
                    res.status(404).json({
                        success: false,
                        message: "Payment not found. ",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: payment,
                });
            }
            catch (error) {
                this.sendError(res, error);
            }
        });
        // Get payment by order ID
        this.getPaymentByOrderId = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.getParam(req, "orderId");
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid order id.",
                    });
                    return;
                }
                const payment = yield payment_service_impl_1.default.getPaymentByOrderId(id);
                if (!payment) {
                    res.status(404).json({
                        success: false,
                        message: "Payment not found for this order",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: payment,
                });
            }
            catch (error) {
                this.sendError(res, error);
            }
        });
        // Get all payments with filters
        this.getAllPayments = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const payments = yield payment_service_impl_1.default.getAllPayments(req.query);
                res.status(200).json({
                    success: true,
                    data: payments,
                });
            }
            catch (error) {
                this.sendError(res, error);
            }
        });
        // Update payment status
        this.updatePaymentStatus = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.getParam(req, "paymentId");
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid payment id.",
                    });
                    return;
                }
                const payment = yield payment_service_impl_1.default.updatePaymentStatus(id, req.body);
                if (!payment) {
                    res.status(404).json({
                        success: false,
                        message: "Payment not found",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Payment status updated successfully",
                    data: payment,
                });
            }
            catch (error) {
                this.sendError(res, error);
            }
        });
        // Complete payment
        this.completePayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.getParam(req, "paymentId");
                const { transactionRef } = req.body;
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid payment id.",
                    });
                    return;
                }
                const payment = yield payment_service_impl_1.default.completePayment(id, transactionRef);
                if (!payment) {
                    res.status(404).json({
                        success: false,
                        message: "Payment not found",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Payment completed successfully",
                    data: payment,
                });
            }
            catch (error) {
                this.sendError(res, error);
            }
        });
        // Fail payment
        this.failPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.getParam(req, "paymentId");
                const { reason } = req.body;
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid payment id.",
                    });
                    return;
                }
                const payment = yield payment_service_impl_1.default.failPayment(id, reason);
                if (!payment) {
                    res.status(404).json({
                        success: false,
                        message: "Payment not found",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Payment marked as failed",
                    data: payment,
                });
            }
            catch (error) {
                this.sendError(res, error);
            }
        });
        // Expire payment
        this.expirePayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.getParam(req, "paymentId");
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid payment id.",
                    });
                    return;
                }
                const payment = yield payment_service_impl_1.default.expirePayment(id);
                if (!payment) {
                    res.status(404).json({
                        success: false,
                        message: "Payment not found",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Payment marked as expired",
                    data: payment,
                });
            }
            catch (error) {
                this.sendError(res, error);
            }
        });
        // Generate KHQR
        this.generateKHQR = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const qrString = yield payment_service_impl_1.default.generateKHQR(req.body);
                res.status(200).json({
                    success: true,
                    data: { khqrString: qrString },
                });
            }
            catch (error) {
                this.sendError(res, error);
            }
        });
        // Verify payment
        this.verifyPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const isVerified = yield payment_service_impl_1.default.verifyPayment(req.body);
                res.status(200).json({
                    success: true,
                    verified: isVerified,
                });
            }
            catch (error) {
                this.sendError(res, error);
            }
        });
        // Check expired payments (background job)
        this.checkExpiredPayments = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield payment_service_impl_1.default.checkExpiredPayments();
                res.status(200).json({
                    success: true,
                    message: "Expired payments checked and updated",
                });
            }
            catch (error) {
                this.sendError(res, error);
            }
        });
    }
    sendError(res, error) {
        const status = typeof (error === null || error === void 0 ? void 0 : error.status) === "number" && error.status >= 400
            ? error.status
            : 500;
        res.status(status).json({
            success: false,
            message: (error === null || error === void 0 ? void 0 : error.message) || "Internal Server Error",
        });
    }
    getParam(req, key) {
        const value = req.params[key];
        if (typeof value !== "string" || value.trim().length === 0) {
            return null;
        }
        return value;
    }
}
exports.default = new PaymentController();
