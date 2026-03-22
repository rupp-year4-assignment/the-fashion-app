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
const orders_1 = __importDefault(require("../../models/orders"));
const payment_card_1 = __importDefault(require("../../models/payment_card"));
const payment_1 = __importDefault(require("../../models/payment"));
const user_1 = __importDefault(require("../../models/user"));
const toResponse_1 = require("../../mapper/toResponse");
const badRequest_exception_1 = __importDefault(require("../../exceptions/badRequest.exception"));
const notFound_exception_1 = __importDefault(require("../../exceptions/notFound.exception"));
const bakong_client_1 = __importDefault(require("../../clients/bakong.client"));
const mongoose_1 = __importDefault(require("mongoose"));
const stripe_config_1 = require("../../config/stripe.config");
class PaymentServiceImpl {
    constructor() {
        this.paymentModel = payment_1.default.getModel();
        this.paymentCardModel = payment_card_1.default.getModel();
        this.stripe = (0, stripe_config_1.getStripeClient)();
    }
    enrichPaymentResponse(payment) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const order = yield orders_1.default.getModel()
                .findById(payment.orderId)
                .select("orderNumber userId")
                .lean();
            if (!order) {
                return toResponse_1.PaymentResponseMapper.toResponse(payment);
            }
            const customer = mongoose_1.default.Types.ObjectId.isValid(((_b = (_a = order.userId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || "")
                ? yield user_1.default.getModel()
                    .findById(order.userId)
                    .select("fullName email phoneNumber")
                    .lean()
                : null;
            return toResponse_1.PaymentResponseMapper.toResponse(payment, {
                orderNumber: (_c = order.orderNumber) !== null && _c !== void 0 ? _c : "",
                customerId: (_f = (_e = (_d = order.userId) === null || _d === void 0 ? void 0 : _d.toString) === null || _e === void 0 ? void 0 : _e.call(_d)) !== null && _f !== void 0 ? _f : "",
                customerName: (_g = customer === null || customer === void 0 ? void 0 : customer.fullName) !== null && _g !== void 0 ? _g : "",
                customerEmail: (_h = customer === null || customer === void 0 ? void 0 : customer.email) !== null && _h !== void 0 ? _h : "",
                customerPhone: (_j = customer === null || customer === void 0 ? void 0 : customer.phoneNumber) !== null && _j !== void 0 ? _j : "",
            });
        });
    }
    enrichPaymentResponses(payments) {
        return __awaiter(this, void 0, void 0, function* () {
            if (payments.length === 0) {
                return [];
            }
            const orderIds = Array.from(new Set(payments.map((payment) => payment.orderId.toString())));
            const orders = yield orders_1.default.getModel()
                .find({
                _id: {
                    $in: orderIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                },
            })
                .select("orderNumber userId")
                .lean();
            const customerIds = Array.from(new Set(orders
                .map((order) => { var _a, _b; return (_b = (_a = order.userId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a); })
                .filter((id) => Boolean(id) && mongoose_1.default.Types.ObjectId.isValid(id))));
            const customers = customerIds.length
                ? yield user_1.default.getModel()
                    .find({
                    _id: {
                        $in: customerIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                    },
                })
                    .select("fullName email phoneNumber")
                    .lean()
                : [];
            const orderMap = new Map(orders.map((order) => [order._id.toString(), order]));
            const customerMap = new Map(customers.map((customer) => [customer._id.toString(), customer]));
            return payments.map((payment) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                const order = orderMap.get(payment.orderId.toString());
                const customer = order
                    ? customerMap.get(((_b = (_a = order.userId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || "")
                    : null;
                return toResponse_1.PaymentResponseMapper.toResponse(payment, {
                    orderNumber: (_c = order === null || order === void 0 ? void 0 : order.orderNumber) !== null && _c !== void 0 ? _c : "",
                    customerId: (_f = (_e = (_d = order === null || order === void 0 ? void 0 : order.userId) === null || _d === void 0 ? void 0 : _d.toString) === null || _e === void 0 ? void 0 : _e.call(_d)) !== null && _f !== void 0 ? _f : "",
                    customerName: (_g = customer === null || customer === void 0 ? void 0 : customer.fullName) !== null && _g !== void 0 ? _g : "",
                    customerEmail: (_h = customer === null || customer === void 0 ? void 0 : customer.email) !== null && _h !== void 0 ? _h : "",
                    customerPhone: (_j = customer === null || customer === void 0 ? void 0 : customer.phoneNumber) !== null && _j !== void 0 ? _j : "",
                });
            });
        });
    }
    normalizeStripeCurrency(order) {
        var _a;
        const rawCurrency = ((_a = order === null || order === void 0 ? void 0 : order.currency) !== null && _a !== void 0 ? _a : "USD").toString().toUpperCase();
        if (rawCurrency !== "USD") {
            throw new badRequest_exception_1.default("Stripe Checkout is configured for USD test payments in this project.");
        }
        return "usd";
    }
    buildStripeLineItems(order) {
        if (!Array.isArray(order === null || order === void 0 ? void 0 : order.items) || order.items.length === 0) {
            throw new badRequest_exception_1.default("Order has no items.");
        }
        return order.items.map((item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const unitAmount = Math.round(Number(item.price || 0) * 100);
            if (unitAmount <= 0) {
                throw new badRequest_exception_1.default(`Invalid item price for product ${item.productName || "Unknown product"}.`);
            }
            return {
                quantity: Number(item.quantity || 1),
                price_data: {
                    currency: this.normalizeStripeCurrency(order),
                    unit_amount: unitAmount,
                    product_data: {
                        name: item.productName || "Fashion Item",
                        metadata: {
                            productId: (_c = (_b = (_a = item.productId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : "",
                            variantId: (_f = (_e = (_d = item.variantId) === null || _d === void 0 ? void 0 : _d.toString) === null || _e === void 0 ? void 0 : _e.call(_d)) !== null && _f !== void 0 ? _f : "",
                            size: (_g = item.size) !== null && _g !== void 0 ? _g : "",
                            color: (_h = item.color) !== null && _h !== void 0 ? _h : "",
                        },
                    },
                },
            };
        });
    }
    findOrderForStripeCheckout(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(data.orderId)) {
                throw new badRequest_exception_1.default("Invalid order id.");
            }
            const order = yield orders_1.default.getModel().findById(data.orderId);
            if (!order) {
                throw new notFound_exception_1.default("Order not found.");
            }
            if (data.userId && order.userId.toString() !== data.userId) {
                throw new badRequest_exception_1.default("Order does not belong to the current user.");
            }
            if (order.orderStatus === "cancelled") {
                throw new badRequest_exception_1.default("Cancelled orders cannot be paid.");
            }
            if (order.paymentStatus === "completed") {
                throw new badRequest_exception_1.default("Order is already paid.");
            }
            if (!Array.isArray(order.items) || order.items.length === 0) {
                throw new badRequest_exception_1.default("Order has no items.");
            }
            if (!order.totalAmount || order.totalAmount <= 0) {
                throw new badRequest_exception_1.default("Order total amount must be greater than zero.");
            }
            return order;
        });
    }
    reusePendingStripeCheckout(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const latestStripePayment = yield this.paymentModel
                .findOne({
                orderId,
                method: "STRIPE",
                status: { $in: ["PENDING", "CREATED"] },
            })
                .sort({ createdAt: -1 });
            if (!(latestStripePayment === null || latestStripePayment === void 0 ? void 0 : latestStripePayment.stripeCheckoutSessionId)) {
                return null;
            }
            const session = yield this.stripe.checkout.sessions.retrieve(latestStripePayment.stripeCheckoutSessionId);
            if (session.status === "complete") {
                yield this.handleStripeCheckoutCompleted({
                    sessionId: session.id,
                    paymentIntentId: typeof session.payment_intent === "string"
                        ? session.payment_intent
                        : (_a = session.payment_intent) === null || _a === void 0 ? void 0 : _a.id,
                    orderId: latestStripePayment.orderId.toString(),
                });
                throw new badRequest_exception_1.default("Order is already paid.");
            }
            if (session.status === "open" && session.url) {
                return {
                    checkoutUrl: session.url,
                    payment: toResponse_1.PaymentResponseMapper.toResponse(latestStripePayment),
                };
            }
            latestStripePayment.status = "FAILED";
            yield latestStripePayment.save();
            yield this.syncOrderPaymentStatus(latestStripePayment.orderId, latestStripePayment.status);
            return null;
        });
    }
    reconcileStripePayment(payment) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            if (payment.method !== "STRIPE" ||
                !payment.stripeCheckoutSessionId ||
                !["CREATED", "PENDING"].includes(payment.status)) {
                return false;
            }
            try {
                const session = yield this.stripe.checkout.sessions.retrieve(payment.stripeCheckoutSessionId);
                if (session.status === "complete" || session.payment_status === "paid") {
                    yield this.handleStripeCheckoutCompleted({
                        sessionId: session.id,
                        paymentIntentId: typeof session.payment_intent === "string"
                            ? session.payment_intent
                            : (_a = session.payment_intent) === null || _a === void 0 ? void 0 : _a.id,
                        orderId: (_d = (_c = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.orderId) !== null && _c !== void 0 ? _c : session.client_reference_id) !== null && _d !== void 0 ? _d : payment.orderId.toString(),
                    });
                    return true;
                }
                if (session.status === "expired") {
                    yield this.handleStripeCheckoutExpired({
                        sessionId: session.id,
                        orderId: (_g = (_f = (_e = session.metadata) === null || _e === void 0 ? void 0 : _e.orderId) !== null && _f !== void 0 ? _f : session.client_reference_id) !== null && _g !== void 0 ? _g : payment.orderId.toString(),
                    });
                    return true;
                }
            }
            catch (error) {
                console.warn(`[PaymentService] Failed to reconcile Stripe session ${payment.stripeCheckoutSessionId}: ${(error === null || error === void 0 ? void 0 : error.message) || error}`);
            }
            return false;
        });
    }
    reconcilePendingStripePayments(orderIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                method: "STRIPE",
                status: { $in: ["CREATED", "PENDING"] },
            };
            if (Array.isArray(orderIds) && orderIds.length > 0) {
                const validOrderIds = orderIds.filter((id) => mongoose_1.default.Types.ObjectId.isValid(id));
                if (validOrderIds.length === 0) {
                    return;
                }
                query.orderId = {
                    $in: validOrderIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                };
            }
            const payments = yield this.paymentModel.find(query).sort({ createdAt: -1 });
            for (const payment of payments) {
                yield this.reconcileStripePayment(payment);
            }
        });
    }
    syncOrderPaymentStatus(orderId, paymentStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield orders_1.default.getModel().findById(orderId);
            if (!order)
                return;
            if (paymentStatus === "COMPLETED" ||
                paymentStatus === "SUCCEEDED" ||
                paymentStatus === "REFUNDED") {
                order.paymentStatus = "completed";
            }
            else if (paymentStatus === "FAILED" || paymentStatus === "EXPIRED") {
                order.paymentStatus = "failed";
            }
            else {
                order.paymentStatus = "pending";
            }
            yield order.save();
        });
    }
    createStripeCheckoutSession(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const order = yield this.findOrderForStripeCheckout(data);
            const reusedSession = yield this.reusePendingStripeCheckout(order._id.toString());
            if (reusedSession) {
                return reusedSession;
            }
            const clientUrl = (_a = process.env.CLIENT_URL) === null || _a === void 0 ? void 0 : _a.trim();
            if (!clientUrl) {
                throw new Error("CLIENT_URL is not configured.");
            }
            const currency = this.normalizeStripeCurrency(order);
            const lineItems = this.buildStripeLineItems(order);
            const successUrl = `${clientUrl.replace(/\/$/, "")}/payment/success?orderId=${order._id.toString()}&session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${clientUrl.replace(/\/$/, "")}/payment/cancel?orderId=${order._id.toString()}`;
            const session = yield this.stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
                line_items: lineItems,
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    orderId: order._id.toString(),
                },
                client_reference_id: order._id.toString(),
            });
            if (!session.url) {
                throw new Error("Stripe did not return a checkout URL.");
            }
            const payment = yield this.paymentModel.create({
                orderId: order._id,
                stripeCheckoutSessionId: session.id,
                amount: order.totalAmount,
                currency: currency.toUpperCase(),
                method: "STRIPE",
                status: "PENDING",
            });
            yield this.syncOrderPaymentStatus(payment.orderId, payment.status);
            return {
                checkoutUrl: session.url,
                payment: toResponse_1.PaymentResponseMapper.toResponse(payment),
            };
        });
    }
    createBakongPayment(order, data, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const currency = (_a = data.currency) !== null && _a !== void 0 ? _a : "USD";
            const { qr, md5 } = bakong_client_1.default.generateMerchantKHQR({
                amount,
                currency,
                billNumber: order._id.toString(),
            });
            const rawExpiry = (_b = data.expiresAt) !== null && _b !== void 0 ? _b : data.expiesAt;
            const parsedExpiry = rawExpiry ? new Date(rawExpiry) : null;
            const expiresAt = parsedExpiry && !Number.isNaN(parsedExpiry.getTime())
                ? parsedExpiry
                : new Date(Date.now() + 15 * 60 * 1000);
            const payment = yield this.paymentModel.create({
                orderId: order._id,
                method: "BAKONG",
                amount,
                currency,
                khqrString: qr,
                md5Hash: md5,
                status: "CREATED",
                expiresAt,
            });
            yield this.syncOrderPaymentStatus(payment.orderId, payment.status);
            return toResponse_1.PaymentResponseMapper.toResponse(payment);
        });
    }
    createCardPayment(order, method, amount, currency, savedCardId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!savedCardId || !mongoose_1.default.Types.ObjectId.isValid(savedCardId)) {
                throw new badRequest_exception_1.default("A valid saved card is required for card payment.");
            }
            const card = yield this.paymentCardModel.findById(savedCardId);
            if (!card || !card.isActive) {
                throw new notFound_exception_1.default("Saved card not found.");
            }
            if (card.userId.toString() !== order.userId.toString()) {
                throw new badRequest_exception_1.default("Saved card does not belong to this order user.");
            }
            if (method === "UNION_PAY" && card.network !== "UNIONPAY") {
                throw new badRequest_exception_1.default("UnionPay payment requires a UnionPay card.");
            }
            if (method === "CREDIT_CARD" && card.network === "UNIONPAY") {
                throw new badRequest_exception_1.default("Use UnionPay payment method for this card.");
            }
            const payment = yield this.paymentModel.create({
                orderId: order._id,
                method,
                amount,
                currency,
                status: "COMPLETED",
                transactionRef: `CARD-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
                paidAt: new Date(),
                cardId: card._id,
                cardLast4: card.last4,
                cardNetwork: card.network,
            });
            yield this.syncOrderPaymentStatus(payment.orderId, payment.status);
            return toResponse_1.PaymentResponseMapper.toResponse(payment);
        });
    }
    createPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const method = (_a = data.method) !== null && _a !== void 0 ? _a : "BAKONG";
            const order = yield orders_1.default.getModel().findById(data.orderId);
            if (!order) {
                throw new notFound_exception_1.default("Order not found.");
            }
            const latestPayment = yield this.paymentModel
                .findOne({ orderId: order._id })
                .sort({ createdAt: -1 });
            if ((latestPayment === null || latestPayment === void 0 ? void 0 : latestPayment.status) === "COMPLETED") {
                return toResponse_1.PaymentResponseMapper.toResponse(latestPayment);
            }
            const amount = order.totalAmount > 0 ? order.totalAmount : data.amount;
            if (!amount || amount <= 0) {
                throw new badRequest_exception_1.default("Payment amount must be greater than zero.");
            }
            const currency = (_b = data.currency) !== null && _b !== void 0 ? _b : "USD";
            if (method === "BAKONG") {
                if (latestPayment) {
                    const isExpired = latestPayment.expiresAt != null &&
                        new Date() > latestPayment.expiresAt &&
                        (latestPayment.status === "CREATED" ||
                            latestPayment.status === "PENDING");
                    if ((latestPayment.status === "CREATED" ||
                        latestPayment.status === "PENDING") &&
                        !isExpired) {
                        return toResponse_1.PaymentResponseMapper.toResponse(latestPayment);
                    }
                    if (isExpired) {
                        latestPayment.status = "EXPIRED";
                        yield latestPayment.save();
                        yield this.syncOrderPaymentStatus(latestPayment.orderId, latestPayment.status);
                    }
                }
                return yield this.createBakongPayment(order, data, amount);
            }
            if (method === "CREDIT_CARD" || method === "UNION_PAY") {
                if (latestPayment &&
                    (latestPayment.status === "CREATED" || latestPayment.status === "PENDING")) {
                    latestPayment.status = "FAILED";
                    yield latestPayment.save();
                    yield this.syncOrderPaymentStatus(latestPayment.orderId, latestPayment.status);
                }
                return yield this.createCardPayment(order, method, amount, currency, data.savedCardId);
            }
            throw new badRequest_exception_1.default("Unsupported payment method.");
        });
    }
    getPaymentById(paymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.paymentModel.findById(paymentId);
            if (!payment)
                throw new Error("Payment not found.");
            return payment;
        });
    }
    getPaymentByOrderId(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.reconcilePendingStripePayments([orderId]);
            const order = yield orders_1.default.getModel().findById(orderId);
            if (!order) {
                throw new Error("Order not found.");
            }
            const payment = yield this.paymentModel
                .findOne({ orderId: order._id })
                .sort({ createdAt: -1 });
            if (!payment)
                return null;
            return this.enrichPaymentResponse(payment);
        });
    }
    getAllPayments(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(filter === null || filter === void 0 ? void 0 : filter.method) || filter.method === "STRIPE") {
                yield this.reconcilePendingStripePayments();
            }
            const query = {};
            if (filter === null || filter === void 0 ? void 0 : filter.status)
                query.status = filter.status;
            if (filter === null || filter === void 0 ? void 0 : filter.method)
                query.method = filter.method;
            if ((filter === null || filter === void 0 ? void 0 : filter.minAmount) != null || (filter === null || filter === void 0 ? void 0 : filter.maxAmount) != null) {
                query.amount = {};
                if ((filter === null || filter === void 0 ? void 0 : filter.minAmount) != null)
                    query.amount.$gte = filter.minAmount;
                if ((filter === null || filter === void 0 ? void 0 : filter.maxAmount) != null)
                    query.amount.$lte = filter.maxAmount;
            }
            const allPayments = yield this.paymentModel.find(query).sort({ createdAt: -1 });
            return this.enrichPaymentResponses(allPayments);
        });
    }
    updatePaymentStatus(paymentId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.paymentModel.findById(paymentId);
            if (!payment) {
                throw new Error("Payment not found.");
            }
            if (payment.status === "COMPLETED") {
                throw new Error("Payment already completed.");
            }
            if (payment.status === "EXPIRED") {
                throw new Error("Payment already expired");
            }
            if (payment.status === "FAILED") {
                throw new Error("Failed payment cannot be updated");
            }
            if (data.status === "COMPLETED" && !data.transactionRef) {
                throw new Error("Transaction reference is required for completion.");
            }
            payment.status = data.status;
            if (data.transactionRef) {
                payment.transactionRef = data.transactionRef;
            }
            if (data.paidAt) {
                payment.paidAt = data.paidAt;
            }
            yield payment.save();
            yield this.syncOrderPaymentStatus(payment.orderId, payment.status);
            return this.enrichPaymentResponse(payment);
        });
    }
    generateKHQR(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield orders_1.default.getModel().findById(data.orderId);
            if (!order)
                throw new Error("Order not found.");
            const { qr } = bakong_client_1.default.generateMerchantKHQR({
                amount: data.amount,
                currency: data.currency,
                billNumber: data.orderId,
            });
            return qr;
        });
    }
    verifyPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verificationResult = bakong_client_1.default.verifyKHQR(data.khqrString);
                if (!verificationResult.isValid) {
                    return false;
                }
                const order = yield orders_1.default.getModel().findById(data.orderId);
                if (!order)
                    throw new Error("Order not found.");
                const payment = yield this.paymentModel.findOne({ orderId: order._id });
                if (!payment) {
                    throw new Error("Payment not found for this order.");
                }
                if (payment.method !== "BAKONG") {
                    throw new Error("KHQR verification only supports Bakong payments.");
                }
                if (payment.khqrString !== data.khqrString) {
                    return false;
                }
                if (payment.status === "COMPLETED") {
                    return true;
                }
                if (payment.expiresAt && new Date() > payment.expiresAt) {
                    yield this.expirePayment(payment._id.toString());
                    return false;
                }
                if (payment.status === "FAILED" || payment.status === "EXPIRED") {
                    return false;
                }
                if (data.transactionRef) {
                    payment.transactionRef = data.transactionRef;
                    payment.status = "PENDING";
                    yield payment.save();
                    yield this.syncOrderPaymentStatus(payment.orderId, payment.status);
                }
                return true;
            }
            catch (error) {
                throw new Error(`Failed to verify payment: ${error.message}`);
            }
        });
    }
    completePayment(paymentId, transactionRef) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.paymentModel.findById(paymentId);
            if (!payment) {
                throw new Error("Payment not found.");
            }
            if (payment.status === "COMPLETED") {
                throw new Error("Payment already completed.");
            }
            if (payment.status === "EXPIRED") {
                throw new Error("Cannot complete an expired payment.");
            }
            if (payment.status === "FAILED") {
                throw new Error("Cannot complete a failed payment.");
            }
            if (!transactionRef || transactionRef.trim().length === 0) {
                throw new Error("Transaction reference is required.");
            }
            payment.status = "COMPLETED";
            payment.transactionRef = transactionRef;
            payment.paidAt = new Date();
            yield payment.save();
            yield this.syncOrderPaymentStatus(payment.orderId, payment.status);
            return toResponse_1.PaymentResponseMapper.toResponse(payment);
        });
    }
    failPayment(paymentId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.paymentModel.findById(paymentId);
            if (!payment) {
                throw new Error("Payment not found.");
            }
            if (payment.status === "COMPLETED") {
                throw new Error("Cannot fail a completed payment.");
            }
            if (payment.status === "FAILED") {
                return toResponse_1.PaymentResponseMapper.toResponse(payment);
            }
            payment.status = "FAILED";
            yield payment.save();
            yield this.syncOrderPaymentStatus(payment.orderId, payment.status);
            if (reason) {
                console.warn(`Payment ${paymentId} marked as failed: ${reason}`);
            }
            return toResponse_1.PaymentResponseMapper.toResponse(payment);
        });
    }
    expirePayment(paymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.paymentModel.findById(paymentId);
            if (!payment) {
                throw new Error("Payment not found.");
            }
            if (payment.status === "COMPLETED") {
                throw new Error("Cannot expire a completed payment.");
            }
            if (payment.status === "EXPIRED") {
                return toResponse_1.PaymentResponseMapper.toResponse(payment);
            }
            payment.status = "EXPIRED";
            yield payment.save();
            yield this.syncOrderPaymentStatus(payment.orderId, payment.status);
            return toResponse_1.PaymentResponseMapper.toResponse(payment);
        });
    }
    handleStripeCheckoutCompleted(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const payment = yield this.paymentModel.findOne({
                stripeCheckoutSessionId: payload.sessionId,
                method: "STRIPE",
            });
            if (!payment) {
                throw new notFound_exception_1.default("Stripe payment session not found.");
            }
            if (payload.orderId &&
                payment.orderId.toString() !== payload.orderId.toString()) {
                throw new badRequest_exception_1.default("Webhook order id does not match payment.");
            }
            if (payment.status === "SUCCEEDED" || payment.status === "COMPLETED") {
                return;
            }
            payment.status = "SUCCEEDED";
            if (payload.paymentIntentId) {
                payment.stripePaymentIntentId = payload.paymentIntentId;
                payment.transactionRef = payload.paymentIntentId;
            }
            payment.paidAt = (_a = payment.paidAt) !== null && _a !== void 0 ? _a : new Date();
            yield payment.save();
            yield this.syncOrderPaymentStatus(payment.orderId, payment.status);
        });
    }
    handleStripeCheckoutExpired(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.paymentModel.findOne({
                stripeCheckoutSessionId: payload.sessionId,
                method: "STRIPE",
            });
            if (!payment) {
                return;
            }
            if (payload.orderId &&
                payment.orderId.toString() !== payload.orderId.toString()) {
                throw new badRequest_exception_1.default("Webhook order id does not match payment.");
            }
            if (payment.status === "SUCCEEDED" || payment.status === "COMPLETED") {
                return;
            }
            if (payment.status === "FAILED" || payment.status === "EXPIRED") {
                return;
            }
            payment.status = "FAILED";
            yield payment.save();
            yield this.syncOrderPaymentStatus(payment.orderId, payment.status);
        });
    }
    handleStripeRefund(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload.paymentIntentId) {
                return;
            }
            const payment = yield this.paymentModel.findOne({
                stripePaymentIntentId: payload.paymentIntentId,
                method: "STRIPE",
            });
            if (!payment) {
                return;
            }
            if (payment.status === "REFUNDED") {
                return;
            }
            payment.status = "REFUNDED";
            yield payment.save();
            yield this.syncOrderPaymentStatus(payment.orderId, payment.status);
        });
    }
    checkExpiredPayments() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const expiredPayments = yield this.paymentModel.find({
                status: { $in: ["CREATED", "PENDING"] },
                expiresAt: { $lte: now },
            });
            for (const payment of expiredPayments) {
                payment.status = "EXPIRED";
                yield payment.save();
                yield this.syncOrderPaymentStatus(payment.orderId, payment.status);
            }
        });
    }
}
exports.default = new PaymentServiceImpl();
