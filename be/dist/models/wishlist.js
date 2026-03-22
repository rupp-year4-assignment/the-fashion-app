"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class WishlistModel {
    constructor() {
        this.model = mongoose_1.default.model("Wishlist", new mongoose_1.default.Schema({
            userId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
            item: {
                productId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
                variantId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
                addedAt: { type: Date, default: Date.now },
            },
        }, { timestamps: true }));
    }
    getModel() {
        return this.model;
    }
}
exports.default = WishlistModel;
