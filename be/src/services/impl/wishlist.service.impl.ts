import WishlistModel, { IWishlist } from "@models/wishlist";
import {
  WishlistItemInput,
  WishlistItemWithProduct,
  WishlistService,
} from "@services/wishlist.service";
import { Model, ObjectId, Types } from "mongoose";

class WishlistServiceImpl implements WishlistService {
  private model: Model<IWishlist>;

  constructor() {
    this.model = new WishlistModel().getModel();
  }

  async addItemToWishlist(
    userId: ObjectId,
    item: WishlistItemInput
  ): Promise<IWishlist> {
    const existing = await this.model.findOne({
      userId: userId as any,
      "item.productId": new Types.ObjectId(item.productId),
      "item.variantId": new Types.ObjectId(item.variantId),
    } as any);

    if (existing) {
      return existing;
    }

    return await this.model.create({
      userId: userId as any,
      item: {
        productId: new Types.ObjectId(item.productId),
        variantId: new Types.ObjectId(item.variantId),
      },
    } as any);
  }

  async removeItemFromWishlist(
    userId: ObjectId,
    productId: string
  ): Promise<void> {
    await this.model.deleteMany({
      userId: userId as any,
      "item.productId": new Types.ObjectId(productId),
    } as any);
  }

  async getWishlistItems(userId: ObjectId): Promise<WishlistItemWithProduct[]> {
    const normalizedUserId = new Types.ObjectId(userId.toString());
    const items = await this.model
      .aggregate([
        { $match: { userId: normalizedUserId as any } },
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

    return items as WishlistItemWithProduct[];
  }

  async countWishlistItems(userId: ObjectId): Promise<number> {
    const normalizedUserId = new Types.ObjectId(userId.toString());
    return await this.model.countDocuments({
      userId: normalizedUserId as any,
    } as any);
  }
}

export default WishlistServiceImpl;
