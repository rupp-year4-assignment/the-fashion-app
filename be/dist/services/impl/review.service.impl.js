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
const badRequest_exception_1 = __importDefault(require("../../exceptions/badRequest.exception"));
const notFound_exception_1 = __importDefault(require("../../exceptions/notFound.exception"));
const orders_1 = __importDefault(require("../../models/orders"));
const product_1 = __importDefault(require("../../models/product"));
const review_1 = __importDefault(require("../../models/review"));
const user_1 = __importDefault(require("../../models/user"));
const mongoose_1 = __importDefault(require("mongoose"));
class ReviewServiceImpl {
    constructor() {
        this.reviewModel = review_1.default.getModel();
        this.orderModel = orders_1.default.getModel();
        this.productModel = product_1.default.getModel();
        this.userModel = user_1.default.getModel();
    }
    mapReview(review) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userModel
                .findById(review.userId)
                .select("fullName firstName lastName")
                .lean();
            const fullName = (user === null || user === void 0 ? void 0 : user.fullName) ||
                [user === null || user === void 0 ? void 0 : user.firstName, user === null || user === void 0 ? void 0 : user.lastName].filter(Boolean).join(" ").trim() ||
                "Customer";
            return {
                id: review._id.toString(),
                userId: review.userId.toString(),
                productId: review.productId.toString(),
                orderId: review.orderId.toString(),
                rating: Number(review.rating || 0),
                comment: review.comment || "",
                userName: fullName,
                createdAt: review.createdAt,
                updatedAt: review.updatedAt,
            };
        });
    }
    getProductReviews(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
                throw new badRequest_exception_1.default("Invalid product id.");
            }
            const reviews = yield this.reviewModel
                .find({ productId: new mongoose_1.default.Types.ObjectId(productId) })
                .sort({ updatedAt: -1, createdAt: -1 })
                .limit(20)
                .lean();
            return Promise.all(reviews.map((review) => this.mapReview(review)));
        });
    }
    upsertProductReview(userId, productId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new badRequest_exception_1.default("Invalid user id.");
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
                throw new badRequest_exception_1.default("Invalid product id.");
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(payload.orderId)) {
                throw new badRequest_exception_1.default("Invalid order id.");
            }
            const [product, order] = yield Promise.all([
                this.productModel.findById(productId),
                this.orderModel.findById(payload.orderId),
            ]);
            if (!product) {
                throw new notFound_exception_1.default("Product not found.");
            }
            if (!order) {
                throw new notFound_exception_1.default("Order not found.");
            }
            if (order.userId.toString() !== userId) {
                throw new badRequest_exception_1.default("You can only review products from your own orders.");
            }
            const isDelivered = order.orderStatus === "delivered" ||
                ((_a = order.delivery) === null || _a === void 0 ? void 0 : _a.deliveryStatus) === "delivered";
            if (!isDelivered) {
                throw new badRequest_exception_1.default("You can review a product only after the order is delivered.");
            }
            const purchasedProduct = Array.isArray(order.items)
                ? order.items.find((item) => item.productId.toString() === productId)
                : null;
            if (!purchasedProduct) {
                throw new badRequest_exception_1.default("This product does not belong to the selected order.");
            }
            const review = yield this.reviewModel.findOneAndUpdate({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                productId: new mongoose_1.default.Types.ObjectId(productId),
            }, {
                $set: {
                    orderId: new mongoose_1.default.Types.ObjectId(payload.orderId),
                    rating: payload.rating,
                    comment: payload.comment.trim(),
                },
            }, {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            });
            return this.mapReview(review);
        });
    }
}
exports.default = new ReviewServiceImpl();
