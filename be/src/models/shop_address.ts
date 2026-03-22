import mongoose, { Document, Model } from "mongoose";

export interface IShopAddress extends Document {
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class ShopAddressModel {
  private model: Model<IShopAddress>;

  constructor() {
    this.model = mongoose.model<IShopAddress>(
      "shop_addresses",
      new mongoose.Schema(
        {
          label: { type: String, required: true, trim: true, default: "Main Shop" },
          street: { type: String, required: true, trim: true },
          city: { type: String, required: true, trim: true },
          state: { type: String, required: true, trim: true },
          postalCode: { type: String, required: true, trim: true },
          country: { type: String, required: true, trim: true },
          location: {
            type: {
              type: String,
              enum: ["Point"],
              required: true,
              default: "Point",
            },
            coordinates: {
              type: [Number],
              required: true,
            },
          },
          isDefault: { type: Boolean, default: true, index: true },
          isActive: { type: Boolean, default: true, index: true },
        },
        { timestamps: true }
      )
    );

    this.model.schema.index({ location: "2dsphere" });
  }

  getModel(): Model<IShopAddress> {
    return this.model;
  }
}

export default new ShopAddressModel();
