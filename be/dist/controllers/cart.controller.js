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
const cart_service_impl_1 = __importDefault(require("../services/impl/cart.service.impl"));
class CartController {
    constructor() {
        this.addToCart = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const cart = yield this.cartService.addToCart(req.body);
                res.status(200).json({ success: true, message: "Item added to cart successfully", data: cart });
            }
            catch (error) {
                res.status(500).json({ success: false, message: "Internal Server Error" });
            }
        });
        this.getCart = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.userId;
                const cart = yield this.cartService.getCartItemsByUserId(id);
                res.status(200).json({ success: true, data: cart, message: "Cart fetched successfully" });
            }
            catch (error) {
                res.status(500).json({ success: false, message: "Internal Server Error" });
            }
        });
        this.updateCartItemQuantity = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, productId, variantId, quantity } = req.body;
                const updatedCart = yield this.cartService.updateCartItemQuantity(userId, productId, variantId, quantity);
                res.status(200).json({ success: true, message: "Cart item quantity updated successfully", data: updatedCart });
            }
            catch (error) {
                res.status(500).json({ success: false, message: "Internal Server Error" });
            }
        });
        this.removeFromCart = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, variantId } = req.body;
                const updatedCart = yield this.cartService.removeFromCart(userId, variantId);
                res.status(200).json({ success: true, message: "Item removed from cart successfully", data: updatedCart });
            }
            catch (error) {
                res.status(500).json({ success: false, message: "Internal Server Error" });
            }
        });
        this.clearCart = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.body;
                yield this.cartService.clearCart(userId);
                res.status(200).json({ success: true, message: "Cart cleared successfully" });
            }
            catch (error) {
                res.status(500).json({ success: false, message: "Internal Server Error" });
            }
        });
        this.cartService = new cart_service_impl_1.default();
    }
}
exports.default = new CartController();
