import CartServiceImpl from "@services/impl/cart.service.impl";
import { Request , Response } from "express";

class CartController {
    private cartService: CartServiceImpl;
    constructor(){
        this.cartService = new CartServiceImpl();
    }

    addToCart = async (req: Request, res: Response): Promise<void> => {
        try {
            const cart = await this.cartService.addToCart(req.body);
            res.status(200).json({success: true, message: "Item added to cart successfully", data: cart});
        } catch (error) {
            res.status(500).json({success: false, message: "Internal Server Error"});
        }
    }

    getCart = async (req: Request , res: Response): Promise<void> => {
        try {
            const id = req.params.userId as string;
            const cart = await this.cartService.getCartItemsByUserId(id);
            res.status(200).json({success: true, data: cart, message: "Cart fetched successfully"});
        } catch (error: any) {
            res.status(500).json({success: false, message: "Internal Server Error"});
        }
    }

    updateCartItemQuantity = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId, productId, variantId, quantity } = req.body;
            const updatedCart = await this.cartService.updateCartItemQuantity(userId, productId, variantId, quantity);
            res.status(200).json({success: true, message: "Cart item quantity updated successfully", data: updatedCart});
        } catch (error: any) {
            res.status(500).json({success: false, message: "Internal Server Error"});
        }
    }

    removeFromCart = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId, variantId } = req.body;
            const updatedCart = await this.cartService.removeFromCart(userId, variantId);
            res.status(200).json({success: true, message: "Item removed from cart successfully", data: updatedCart});
        } catch (error: any) {
            res.status(500).json({success: false, message: "Internal Server Error"});
        }
    }

    clearCart = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.body;
            await this.cartService.clearCart(userId);
            res.status(200).json({success: true, message: "Cart cleared successfully"});
        } catch (error: any) {
            res.status(500).json({success: false, message: "Internal Server Error"});
        }
    }
}

export default new  CartController();