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
const wishlist_1 = __importDefault(require("../../models/wishlist"));
const mongoose_1 = require("mongoose");
class WishlistServiceImpl {
    constructor() {
        this.model = new wishlist_1.default().getModel();
    }
    addItemToWishlist(userId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.model.findOne({
                userId: userId,
                "item.productId": new mongoose_1.Types.ObjectId(item.productId),
                "item.variantId": new mongoose_1.Types.ObjectId(item.variantId),
            });
            if (existing) {
                return existing;
            }
            return yield this.model.create({
                userId: userId,
                item: {
                    productId: new mongoose_1.Types.ObjectId(item.productId),
                    variantId: new mongoose_1.Types.ObjectId(item.variantId),
                },
            });
        });
    }
    removeItemFromWishlist(userId, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.deleteMany({
                userId: userId,
                "item.productId": new mongoose_1.Types.ObjectId(productId),
            });
        });
    }
    getWishlistItems(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedUserId = new mongoose_1.Types.ObjectId(userId.toString());
            const items = yield this.model
                .aggregate([
                { $match: { userId: normalizedUserId } },
                {
                    $lookup: {
                        from: "products",
                        localField: "item.productId",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                {
                    $unwind: {
                        path: "$product",
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ])
                .exec();
            return items;
        });
    }
    countWishlistItems(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedUserId = new mongoose_1.Types.ObjectId(userId.toString());
            return yield this.model.countDocuments({
                userId: normalizedUserId,
            });
        });
    }
}
exports.default = WishlistServiceImpl;
