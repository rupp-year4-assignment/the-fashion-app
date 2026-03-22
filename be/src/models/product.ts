import { ProductVariant } from "@ctypes/product_variant";
import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface IProduct extends Document {
  productId: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  status: "available" | "out_of_stock";
  variants: ProductVariant[];
  images: string[];
}

class ProductModel {
  private model: Model<IProduct>;

  constructor() {
    const productSchema = new Schema<IProduct>(
      {
        productId: {
          type: String,
          required: true,
          unique: true,
          default: () => crypto.randomUUID(),
        },
        name: { type: String, required: true },
        description: { type: String, required: true },
        brand: { type: String, required: true },
        category: { type: String, required: true },
        status: {
          type: String,
          required: true,
          enum: ["available", "out_of_stock"],
        },
        variants: [
          {
            variantId: { type: Schema.Types.ObjectId, required: true },
            size: { type: String, required: true },
            color: { type: String, required: true },
            sku: { type: String, required: true, unique: true },
            price: { type: Number, required: true },
            stock: { type: Number, default: 0 },
          },
        ],
        images: { type: [String], default: [] },
      },
      { timestamps: true },
    );

    this.model = mongoose.model<IProduct>("products", productSchema);
  }

  getModel(): Model<IProduct> {
    return this.model;
  }
}

export default new ProductModel();
