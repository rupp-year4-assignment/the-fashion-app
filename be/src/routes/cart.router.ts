import cart from "@models/cart";
import { Router } from "express";
import cartController from "@controllers/cart.controller";

const router = Router();

router.post("/cart", cartController.addToCart);
router.get("/cart/:userId", cartController.getCart);
router.put("/cart", cartController.updateCartItemQuantity);
router.delete("/cart", cartController.removeFromCart);
router.delete("/cart/clear", cartController.clearCart);

export default router;