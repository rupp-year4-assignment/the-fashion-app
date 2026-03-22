import mongoose, { Document, Model, ObjectId } from "mongoose";

export interface IWishlist extends Document {
  userId: ObjectId;
  item: {
    productId: ObjectId;
    variantId: ObjectId;
    addedAt: Date;
  };
}

class WishlistModel {
  private model: Model<IWishlist>;

  constructor() {
    this.model = mongoose.model<IWishlist>(
      "Wishlist",
      new mongoose.Schema(
        {
          userId: { type: mongoose.Schema.Types.ObjectId, required: true },
          item: {
            productId: { type: mongoose.Schema.Types.ObjectId, required: true },
            variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
            addedAt: { type: Date, default: Date.now },
          },
        },
        { timestamps: true }
      )
    );
  }

  getModel(): Model<IWishlist> {
    return this.model;
  }
}

export default WishlistModel;
