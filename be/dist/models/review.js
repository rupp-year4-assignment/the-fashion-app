"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class ReviewModel {
    constructor() {
        const reviewSchema = new mongoose_1.default.Schema({
            userId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
            productId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
            orderId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
            rating: { type: Number, required: true },
            comment: { type: String, required: true },
        }, { timestamps: true });
        reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
        this.model = mongoose_1.default.model("Review", reviewSchema);
    }
    getModel() {
        return this.model;
    }
}
exports.default = new ReviewModel();
