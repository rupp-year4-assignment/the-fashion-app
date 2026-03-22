"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = __importDefault(require("../controllers/cart.controller"));
const router = (0, express_1.Router)();
router.post("/cart", cart_controller_1.default.addToCart);
router.get("/cart/:userId", cart_controller_1.default.getCart);
router.put("/cart", cart_controller_1.default.updateCartItemQuantity);
router.delete("/cart", cart_controller_1.default.removeFromCart);
router.delete("/cart/clear", cart_controller_1.default.clearCart);
exports.default = router;
