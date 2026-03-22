import { Router } from "express";
import WishlistServiceImpl from "@services/impl/wishlist.service.impl";
import WishlistController from "@controllers/wishlist.controller";
import validationMiddleware, {
  ValidationMiddleware,
} from "@middlewares/validation.middleware";
import asyncHandler from "@utils/asyncHandler";

const wishlistRouter = Router();

const wishlistController = new WishlistController(new WishlistServiceImpl());

wishlistRouter.get("/", asyncHandler(wishlistController.getWishlists));
wishlistRouter.post(
  "/",
  validationMiddleware.addWishlists,
  ValidationMiddleware,
  asyncHandler(wishlistController.addWishlists)
);

wishlistRouter.delete(
  "/",
  validationMiddleware.removeWishlists,
  ValidationMiddleware,
  asyncHandler(wishlistController.removeWishlists)
);

export default wishlistRouter;
