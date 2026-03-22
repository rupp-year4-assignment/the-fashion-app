import { IUser } from "@models/user";
import { WishlistItemInput, WishlistService } from "@services/wishlist.service";
import { Request, Response } from "express";

class WishlistController {
  private wishlistService: WishlistService;

  constructor(wishlistService: WishlistService) {
    this.wishlistService = wishlistService;

    this.getWishlists = this.getWishlists.bind(this);
    this.addWishlists = this.addWishlists.bind(this);
    this.removeWishlists = this.removeWishlists.bind(this);
  }

  async getWishlists(req: Request, res: Response) {
    const user = req.user as IUser;

    const items = await this.wishlistService.getWishlistItems(user._id as any);

    res.status(200).send({
      message:
        items.length == 0
          ? "No wishlist items found"
          : "Wishlist items retrieved successfully",
      isSuccess: true,
      statusCode: 200,
      data: items,
    });
  }

  async addWishlists(req: Request, res: Response) {
    const user = req.user as IUser;
    const item = req.body as WishlistItemInput;

    await this.wishlistService.addItemToWishlist(user._id as any, item);

    res.status(201).send({
      message: "Item added to wishlist successfully",
      isSuccess: true,
      statusCode: 201,
    });
  }

  async removeWishlists(req: Request, res: Response) {
    const user = req.user as IUser;
    const { productId } = req.body as { productId: string };

    await this.wishlistService.removeItemFromWishlist(
      user._id as any,
      productId
    );

    res.status(200).send({
      message: "Item removed from wishlist successfully",
      isSuccess: true,
      statusCode: 200,
    });
  }
}

export default WishlistController;
