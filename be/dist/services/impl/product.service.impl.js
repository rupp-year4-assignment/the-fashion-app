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
const product_1 = __importDefault(require("../../models/product"));
const review_1 = __importDefault(require("../../models/review"));
const user_1 = __importDefault(require("../../models/user"));
const mongoose_1 = __importDefault(require("mongoose"));
class ProductServiceImpl {
    constructor() {
        this.reviewModel = review_1.default.getModel();
        this.userModel = user_1.default.getModel();
    }
    buildProductLookupQuery(id) {
        const query = [{ productId: id }];
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            query.push({ _id: id });
        }
        return { $or: query };
    }
    buildReviewStats(productIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const validProductIds = Array.from(new Set(productIds.filter((id) => mongoose_1.default.Types.ObjectId.isValid(id))));
            if (validProductIds.length === 0) {
                return new Map();
            }
            const stats = yield this.reviewModel.aggregate([
                {
                    $match: {
                        productId: {
                            $in: validProductIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                        },
                    },
                },
                {
                    $group: {
                        _id: "$productId",
                        reviewCount: { $sum: 1 },
                        rating: { $avg: "$rating" },
                    },
                },
            ]);
            return new Map(stats.map((item) => [
                item._id.toString(),
                {
                    rating: Number(Number(item.rating || 0).toFixed(1)),
                    reviewCount: Number(item.reviewCount || 0),
                },
            ]));
        });
    }
    buildReviewDetails(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
                return [];
            }
            const reviews = yield this.reviewModel
                .find({ productId: new mongoose_1.default.Types.ObjectId(productId) })
                .sort({ updatedAt: -1, createdAt: -1 })
                .limit(20)
                .lean();
            if (reviews.length === 0) {
                return [];
            }
            const userIds = Array.from(new Set(reviews
                .map((review) => { var _a, _b; return (_b = (_a = review.userId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a); })
                .filter((id) => typeof id === "string" && mongoose_1.default.Types.ObjectId.isValid(id))));
            const users = userIds.length
                ? yield this.userModel
                    .find({
                    _id: {
                        $in: userIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                    },
                })
                    .select("fullName firstName lastName")
                    .lean()
                : [];
            const userMap = new Map(users.map((user) => [
                user._id.toString(),
                user.fullName ||
                    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
                    "Customer",
            ]));
            return reviews.map((review) => {
                var _a, _b;
                return ({
                    id: review._id.toString(),
                    userId: review.userId.toString(),
                    orderId: ((_b = (_a = review.orderId) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || "",
                    rating: Number(review.rating || 0),
                    comment: review.comment || "",
                    userName: userMap.get(review.userId.toString()) || "Customer",
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt,
                });
            });
        });
    }
    enrichProduct(product_2) {
        return __awaiter(this, arguments, void 0, function* (product, includeReviews = false) {
            var _a, _b;
            if (!product) {
                return null;
            }
            const plainProduct = typeof product.toObject === "function" ? product.toObject() : product;
            const productId = ((_b = (_a = plainProduct._id) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || "";
            const [reviewStats, reviews] = yield Promise.all([
                this.buildReviewStats([productId]),
                includeReviews ? this.buildReviewDetails(productId) : Promise.resolve([]),
            ]);
            const stats = reviewStats.get(productId);
            return Object.assign(Object.assign({}, plainProduct), { rating: (stats === null || stats === void 0 ? void 0 : stats.rating) || 0, reviewCount: (stats === null || stats === void 0 ? void 0 : stats.reviewCount) || 0, reviews });
        });
    }
    createProduct(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const productModel = product_1.default.getModel();
            const newProduct = new productModel(data);
            return yield newProduct.save();
        });
    }
    getAllProducts(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const productModel = product_1.default.getModel();
            // Build query object
            const query = {};
            // Text filters (partial match, case-insensitive)
            if (filters === null || filters === void 0 ? void 0 : filters.name) {
                query.name = { $regex: filters.name, $options: "i" };
            }
            if (filters === null || filters === void 0 ? void 0 : filters.brand) {
                query.brand = { $regex: filters.brand, $options: "i" };
            }
            if (filters === null || filters === void 0 ? void 0 : filters.category) {
                query.category = { $regex: filters.category, $options: "i" };
            }
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
                query.status = filters.status;
            }
            // Filter by variant properties
            if (filters === null || filters === void 0 ? void 0 : filters.size) {
                query["variants.size"] = filters.size;
            }
            if (filters === null || filters === void 0 ? void 0 : filters.color) {
                query["variants.color"] = { $regex: filters.color, $options: "i" };
            }
            // Price range filter
            if ((filters === null || filters === void 0 ? void 0 : filters.minPrice) !== undefined || (filters === null || filters === void 0 ? void 0 : filters.maxPrice) !== undefined) {
                query["variants.price"] = {};
                if ((filters === null || filters === void 0 ? void 0 : filters.minPrice) !== undefined) {
                    query["variants.price"].$gte = filters.minPrice;
                }
                if ((filters === null || filters === void 0 ? void 0 : filters.maxPrice) !== undefined) {
                    query["variants.price"].$lte = filters.maxPrice;
                }
            }
            // Pagination
            const page = (filters === null || filters === void 0 ? void 0 : filters.page) || 1;
            const limit = (filters === null || filters === void 0 ? void 0 : filters.limit) || 10;
            const skip = (page - 1) * limit;
            // Sorting
            const sortBy = (filters === null || filters === void 0 ? void 0 : filters.sortBy) || "createdAt";
            const sortOrder = (filters === null || filters === void 0 ? void 0 : filters.sortOrder) === "asc" ? 1 : -1;
            const sort = { [sortBy]: sortOrder };
            // Execute query with pagination
            const [products, total] = yield Promise.all([
                productModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
                productModel.countDocuments(query).exec(),
            ]);
            const reviewStats = yield this.buildReviewStats(products.map((product) => product._id.toString()));
            return {
                data: products.map((product) => {
                    const plainProduct = product.toObject();
                    const stats = reviewStats.get(product._id.toString());
                    return Object.assign(Object.assign({}, plainProduct), { rating: (stats === null || stats === void 0 ? void 0 : stats.rating) || 0, reviewCount: (stats === null || stats === void 0 ? void 0 : stats.reviewCount) || 0 });
                }),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        });
    }
    getProductById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const productModel = product_1.default.getModel();
            const product = yield productModel
                .findOne(this.buildProductLookupQuery(id))
                .exec();
            return this.enrichProduct(product, true);
        });
    }
    updateProduct(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const productModel = product_1.default.getModel();
            const updatedProduct = yield productModel
                .findOneAndUpdate(this.buildProductLookupQuery(id), data, {
                new: true,
                runValidators: true,
            })
                .exec();
            if (!updatedProduct) {
                throw new Error("Product not found");
            }
            return updatedProduct;
        });
    }
    deleteProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const productModel = product_1.default.getModel();
            const deletedProduct = yield productModel
                .findOneAndDelete(this.buildProductLookupQuery(id))
                .exec();
            if (!deletedProduct) {
                throw new Error("Product not found");
            }
        });
    }
}
exports.default = ProductServiceImpl;
