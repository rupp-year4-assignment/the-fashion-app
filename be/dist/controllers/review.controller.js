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
const review_service_impl_1 = __importDefault(require("../services/impl/review.service.impl"));
class ReviewController {
    constructor() {
        this.listProductReviews = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const productId = Array.isArray(req.params.productId)
                    ? req.params.productId[0]
                    : req.params.productId;
                const reviews = yield review_service_impl_1.default.getProductReviews(productId);
                res.status(200).json({
                    success: true,
                    message: "Product reviews fetched successfully.",
                    data: reviews,
                });
            }
            catch (error) {
                res.status((error === null || error === void 0 ? void 0 : error.status) || 500).json({
                    success: false,
                    message: (error === null || error === void 0 ? void 0 : error.message) || "Internal Server Error",
                });
            }
        });
        this.upsertProductReview = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentUser = req.user;
                if (!(currentUser === null || currentUser === void 0 ? void 0 : currentUser._id)) {
                    res.status(403).json({
                        success: false,
                        message: "Forbidden",
                    });
                    return;
                }
                const productId = Array.isArray(req.params.productId)
                    ? req.params.productId[0]
                    : req.params.productId;
                const review = yield review_service_impl_1.default.upsertProductReview(currentUser._id.toString(), productId, req.body);
                res.status(201).json({
                    success: true,
                    message: "Review saved successfully.",
                    data: review,
                });
            }
            catch (error) {
                res.status((error === null || error === void 0 ? void 0 : error.status) || 500).json({
                    success: false,
                    message: (error === null || error === void 0 ? void 0 : error.message) || "Internal Server Error",
                });
            }
        });
    }
}
exports.default = new ReviewController();
