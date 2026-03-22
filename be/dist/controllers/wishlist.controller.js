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
Object.defineProperty(exports, "__esModule", { value: true });
class WishlistController {
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
        this.getWishlists = this.getWishlists.bind(this);
        this.addWishlists = this.addWishlists.bind(this);
        this.removeWishlists = this.removeWishlists.bind(this);
    }
    getWishlists(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const items = yield this.wishlistService.getWishlistItems(user._id);
            res.status(200).send({
                message: items.length == 0
                    ? "No wishlist items found"
                    : "Wishlist items retrieved successfully",
                isSuccess: true,
                statusCode: 200,
                data: items,
            });
        });
    }
    addWishlists(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const item = req.body;
            yield this.wishlistService.addItemToWishlist(user._id, item);
            res.status(201).send({
                message: "Item added to wishlist successfully",
                isSuccess: true,
                statusCode: 201,
            });
        });
    }
    removeWishlists(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const { productId } = req.body;
            yield this.wishlistService.removeItemFromWishlist(user._id, productId);
            res.status(200).send({
                message: "Item removed from wishlist successfully",
                isSuccess: true,
                statusCode: 200,
            });
        });
    }
}
exports.default = WishlistController;
