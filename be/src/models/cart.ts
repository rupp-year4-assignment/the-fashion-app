import mongoose, { Model, Schema, Document, Types } from "mongoose";

export interface ICart extends Document {
  userId: Types.ObjectId;
  item: {
    productId: Types.ObjectId;
    variantId: Types.ObjectId;
    size: string;
    color: string;
    price: number;
    quantity: number;
  }[];
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

class CartModel {
  private model: Model<ICart>;

  constructor() {
    this.model = mongoose.model<ICart>(
      "Cart",
      new Schema<ICart>(
        {
          userId: { type: Schema.Types.ObjectId, required: true },
          item: [
            {
              productId: { type: Schema.Types.ObjectId, required: true },
              variantId: { type: Schema.Types.ObjectId, required: true },
              size: { type: String, required: true },
              color: { type: String, required: true },
              price: { type: Number, required: true },
              quantity: { type: Number, required: true },
            },
          ],
          status: {
            type: String,
            enum: ["active", "inactive"],
            required: true,
          },
        },
        { timestamps: true }
      )
    );
  }

  getModel(): Model<ICart> {
    return this.model;
  }
}

export default new CartModel();
