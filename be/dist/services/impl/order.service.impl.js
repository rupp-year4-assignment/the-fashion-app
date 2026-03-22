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
exports.OrderServiceImpl = void 0;
const cart_1 = __importDefault(require("../../models/cart"));
const orders_1 = __importDefault(require("../../models/orders"));
const product_1 = __importDefault(require("../../models/product"));
const review_1 = __importDefault(require("../../models/review"));
const user_1 = __importDefault(require("../../models/user"));
const shop_address_service_impl_1 = __importDefault(require("../impl/shop_address.service.impl"));
const payment_service_impl_1 = __importDefault(require("../impl/payment.service.impl"));
const mongoose_1 = __importDefault(require("mongoose"));
class OrderServiceImpl {
    constructor() {
        this.orderModel = orders_1.default.getModel();
        this.reviewModel = review_1.default.getModel();
        this.shopAddressService = new shop_address_service_impl_1.default();
    }
    buildProductSnapshotMap(productIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const validProductIds = Array.from(new Set(productIds.filter((id) => mongoose_1.default.Types.ObjectId.isValid(id))));
            if (validProductIds.length === 0) {
                return new Map();
            }
            const products = yield product_1.default.getModel()
                .find({
                _id: {
                    $in: validProductIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                },
            })
                .lean();
            return new Map(products.map((product) => {
                var _a;
                return [
                    product._id.toString(),
                    {
                        name: (_a = product.name) !== null && _a !== void 0 ? _a : "Product",
                        image: Array.isArray(product.images) && product.images.length > 0
                            ? product.images[0]
                            : undefined,
                    },
                ];
            }));
        });
    }
    enrichOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const plainOrder = order.toObject();
            const productMap = yield this.buildProductSnapshotMap(plainOrder.items.map((item) => item.productId.toString()));
            const reviewMap = yield this.buildReviewMapForOrders([
                {
                    userId: ((_b = (_a = plainOrder.userId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || "",
                    productIds: plainOrder.items.map((item) => item.productId.toString()),
                },
            ]);
            const customer = mongoose_1.default.Types.ObjectId.isValid(((_d = (_c = plainOrder.userId) === null || _c === void 0 ? void 0 : _c.toString) === null || _d === void 0 ? void 0 : _d.call(_c)) || "") &&
                (yield user_1.default.getModel()
                    .findById(plainOrder.userId)
                    .select("fullName email phoneNumber")
                    .lean());
            return Object.assign(Object.assign({}, plainOrder), { customer: customer
                    ? {
                        id: customer._id.toString(),
                        name: (_e = customer.fullName) !== null && _e !== void 0 ? _e : "Customer",
                        email: (_f = customer.email) !== null && _f !== void 0 ? _f : "",
                        phone: (_g = customer.phoneNumber) !== null && _g !== void 0 ? _g : "",
                    }
                    : null, items: plainOrder.items.map((item) => {
                    var _a, _b;
                    const snapshot = productMap.get(item.productId.toString());
                    const review = reviewMap.get(`${((_b = (_a = plainOrder.userId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || ""}:${item.productId.toString()}`);
                    return Object.assign(Object.assign({}, item), { productName: item.productName || (snapshot === null || snapshot === void 0 ? void 0 : snapshot.name) || "Product", image: item.image || (snapshot === null || snapshot === void 0 ? void 0 : snapshot.image), hasReview: Boolean(review), reviewId: review === null || review === void 0 ? void 0 : review.id, reviewRating: review === null || review === void 0 ? void 0 : review.rating, reviewComment: review === null || review === void 0 ? void 0 : review.comment });
                }) });
        });
    }
    buildReviewMapForOrders(entries) {
        return __awaiter(this, void 0, void 0, function* () {
            const userIds = Array.from(new Set(entries
                .map((entry) => entry.userId)
                .filter((value) => mongoose_1.default.Types.ObjectId.isValid(value))));
            const productIds = Array.from(new Set(entries.flatMap((entry) => entry.productIds).filter((value) => mongoose_1.default.Types.ObjectId.isValid(value))));
            if (userIds.length === 0 || productIds.length === 0) {
                return new Map();
            }
            const reviews = yield this.reviewModel
                .find({
                userId: {
                    $in: userIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                },
                productId: {
                    $in: productIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                },
            })
                .select("userId productId rating comment")
                .lean();
            return new Map(reviews.map((review) => [
                `${review.userId.toString()}:${review.productId.toString()}`,
                {
                    id: review._id.toString(),
                    rating: Number(review.rating || 0),
                    comment: review.comment || "",
                },
            ]));
        });
    }
    enrichOrders(orders) {
        return __awaiter(this, void 0, void 0, function* () {
            const productMap = yield this.buildProductSnapshotMap(orders.flatMap((order) => order.items.map((item) => item.productId.toString())));
            const reviewMap = yield this.buildReviewMapForOrders(orders.map((order) => {
                var _a, _b;
                return ({
                    userId: ((_b = (_a = order.userId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || "",
                    productIds: order.items.map((item) => item.productId.toString()),
                });
            }));
            const customerIds = Array.from(new Set(orders
                .map((order) => { var _a; return (_a = order.userId) === null || _a === void 0 ? void 0 : _a.toString(); })
                .filter((value) => Boolean(value) && mongoose_1.default.Types.ObjectId.isValid(value))));
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
            const customerMap = new Map(customers.map((customer) => {
                var _a, _b, _c;
                return [
                    customer._id.toString(),
                    {
                        id: customer._id.toString(),
                        name: (_a = customer.fullName) !== null && _a !== void 0 ? _a : "Customer",
                        email: (_b = customer.email) !== null && _b !== void 0 ? _b : "",
                        phone: (_c = customer.phoneNumber) !== null && _c !== void 0 ? _c : "",
                    },
                ];
            }));
            return orders.map((order) => {
                var _a, _b;
                const plainOrder = order.toObject();
                return Object.assign(Object.assign({}, plainOrder), { customer: customerMap.get(((_b = (_a = plainOrder.userId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || "") || null, items: plainOrder.items.map((item) => {
                        var _a, _b;
                        const snapshot = productMap.get(item.productId.toString());
                        const review = reviewMap.get(`${((_b = (_a = plainOrder.userId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || ""}:${item.productId.toString()}`);
                        return Object.assign(Object.assign({}, item), { productName: item.productName || (snapshot === null || snapshot === void 0 ? void 0 : snapshot.name) || "Product", image: item.image || (snapshot === null || snapshot === void 0 ? void 0 : snapshot.image), hasReview: Boolean(review), reviewId: review === null || review === void 0 ? void 0 : review.id, reviewRating: review === null || review === void 0 ? void 0 : review.rating, reviewComment: review === null || review === void 0 ? void 0 : review.comment });
                    }) });
            });
        });
    }
    normalizeAddress(payload) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const fallbackCoordinates = [104.9282, 11.5564];
        const rawCoordinates = (_a = payload === null || payload === void 0 ? void 0 : payload.location) === null || _a === void 0 ? void 0 : _a.coordinates;
        let coordinates = fallbackCoordinates;
        if (Array.isArray(rawCoordinates) &&
            rawCoordinates.length === 2 &&
            Number.isFinite(Number(rawCoordinates[0])) &&
            Number.isFinite(Number(rawCoordinates[1]))) {
            coordinates = [Number(rawCoordinates[0]), Number(rawCoordinates[1])];
        }
        else if (rawCoordinates && typeof rawCoordinates === "object") {
            const lat = Number((_c = (_b = rawCoordinates.latitude) !== null && _b !== void 0 ? _b : rawCoordinates.latidute) !== null && _c !== void 0 ? _c : rawCoordinates.lat);
            const lng = Number((_e = (_d = rawCoordinates.longitude) !== null && _d !== void 0 ? _d : rawCoordinates.longtitude) !== null && _e !== void 0 ? _e : rawCoordinates.lng);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
                coordinates = [lng, lat];
            }
        }
        const street = ((_f = payload === null || payload === void 0 ? void 0 : payload.street) === null || _f === void 0 ? void 0 : _f.trim()) || "Unknown street";
        const city = ((_g = payload === null || payload === void 0 ? void 0 : payload.city) === null || _g === void 0 ? void 0 : _g.trim()) || "Phnom Penh";
        const state = ((_h = payload === null || payload === void 0 ? void 0 : payload.state) === null || _h === void 0 ? void 0 : _h.trim()) || city;
        const postalCode = ((_j = payload === null || payload === void 0 ? void 0 : payload.postalCode) === null || _j === void 0 ? void 0 : _j.trim()) || "12000";
        const country = ((_k = payload === null || payload === void 0 ? void 0 : payload.country) === null || _k === void 0 ? void 0 : _k.trim()) || "Cambodia";
        return {
            street,
            city,
            state,
            postalCode,
            country,
            location: {
                type: "Point",
                coordinates,
            },
        };
    }
    createOrder(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!data.item || data.item.length === 0) {
                throw new Error("Order must contain at least one item.");
            }
            if (!((_a = data.delivery) === null || _a === void 0 ? void 0 : _a.address)) {
                throw new Error("Delivery address is required.");
            }
            const totalAmount = data.item.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const productMap = yield this.buildProductSnapshotMap(data.item.map((item) => item.productId));
            const orderNumbes = `ORD-${Date.now()}`;
            const trackingNumber = `TRK-${Math.random()
                .toString(36)
                .substring(2, 9)
                .toLocaleUpperCase()}`;
            const destinationAddress = this.normalizeAddress(data.delivery.address);
            const defaultShopAddress = yield this.shopAddressService.getDefaultShopAddress();
            const pickupAddress = this.normalizeAddress(defaultShopAddress);
            const courier = ((_b = data.delivery.courier) === null || _b === void 0 ? void 0 : _b.trim()) || "Standard";
            const order = yield this.orderModel.create({
                orderNumber: orderNumbes,
                userId: new mongoose_1.default.Types.ObjectId(data.userId),
                items: data.item.map((item) => {
                    const snapshot = productMap.get(item.productId);
                    return {
                        productId: new mongoose_1.default.Types.ObjectId(item.productId),
                        variantId: new mongoose_1.default.Types.ObjectId(item.variantId),
                        size: item.size,
                        color: item.color,
                        price: item.price,
                        quantity: item.quantity,
                        productName: item.productName || (snapshot === null || snapshot === void 0 ? void 0 : snapshot.name) || "Product",
                        image: snapshot === null || snapshot === void 0 ? void 0 : snapshot.image,
                    };
                }),
                totalAmount: totalAmount,
                orderStatus: "pending",
                paymentStatus: "pending",
                delivery: {
                    address: Object.assign({}, destinationAddress),
                    pickupAddress: Object.assign({}, pickupAddress),
                    destinationAddress: Object.assign({}, destinationAddress),
                    deliveryStatus: "preparing",
                    trackingNumber,
                    courier,
                },
            });
            yield cart_1.default.getModel().findOneAndUpdate({
                userId: new mongoose_1.default.Types.ObjectId(data.userId),
                status: "active",
            }, { status: "inactive" });
            return (yield this.enrichOrder(order));
        });
    }
    getOrderById(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield payment_service_impl_1.default.reconcilePendingStripePayments([orderId]);
            const order = yield this.orderModel.findById(orderId);
            if (!order) {
                throw new Error("Order not found.");
            }
            return (yield this.enrichOrder(order));
        });
    }
    getAllOrders() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            try {
                let [orders, total] = yield Promise.all([
                    this.orderModel
                        .find()
                        .skip(skip)
                        .limit(limit)
                        .sort({ createdAt: -1 })
                        .exec(),
                    this.orderModel.countDocuments(),
                ]);
                yield payment_service_impl_1.default.reconcilePendingStripePayments(orders.map((order) => order._id.toString()));
                orders = yield this.orderModel
                    .find()
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .exec();
                return {
                    data: (yield this.enrichOrders(orders)),
                    total,
                    page,
                    limit,
                };
            }
            catch (error) {
                throw new Error("Error fetching orders.");
            }
        });
    }
    getOrderByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new Error("Invalid user ID");
            }
            try {
                let orders = yield this.orderModel
                    .find({ userId: userId })
                    .sort({ createdAt: -1 })
                    .exec();
                yield payment_service_impl_1.default.reconcilePendingStripePayments(orders.map((order) => order._id.toString()));
                orders = yield this.orderModel
                    .find({ userId: userId })
                    .sort({ createdAt: -1 })
                    .exec();
                return (yield this.enrichOrders(orders));
            }
            catch (error) {
                throw new Error(`Error fetching orders for user: ${error}`);
            }
        });
    }
}
exports.OrderServiceImpl = OrderServiceImpl;
exports.default = new OrderServiceImpl();
