import { IWishlist } from "@models/wishlist";
import { ObjectId } from "mongoose";

export interface WishlistItemInput {
  productId: string;
  variantId: string;
}

export type WishlistItemWithProduct = IWishlist & {
  product?: Record<string, unknown> | null;
};

export interface WishlistService {
  addItemToWishlist(
    userId: ObjectId,
    item: WishlistItemInput
  ): Promise<IWishlist>;
  removeItemFromWishlist(userId: ObjectId, productId: string): Promise<void>;
  getWishlistItems(userId: ObjectId): Promise<WishlistItemWithProduct[]>;
  countWishlistItems(userId: ObjectId): Promise<number>;
}
