import { LocationMetaData } from "@ctypes/location";
import mongoose, { Document, ObjectId } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  userId: ObjectId;
  items: {
    productId: ObjectId;
    variantId: ObjectId;
    size: string;
    color: string;
    price: number;
    quantity: number;
    productName: string;
    image?: string;
  }[];
  totalAmount: number;
  orderStatus: "pending" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed";
  delivery: {
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      location: LocationMetaData;
    };
    pickupAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      location: LocationMetaData;
    };
    destinationAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      location: LocationMetaData;
    };
    deliveryStatus: "preparing" | "in_transit" | "delivered";
    trackingNumber: string;
    courier: string;
  };
}

class OrderModel {
  private model;

  constructor() {
    this.model = mongoose.model<IOrder>(
      "Order",
      new mongoose.Schema(
        {
          orderNumber: { type: String, required: true, unique: true },
          userId: { type: mongoose.Schema.Types.ObjectId, required: true },
          items: [
            {
              productId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
              },
              variantId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
              },
              size: { type: String, required: true },
              color: { type: String, required: true },
              price: { type: Number, required: true },
              quantity: { type: Number, required: true },
              productName: { type: String, required: true },
              image: { type: String, required: false },
            },
          ],
          totalAmount: { type: Number, required: true },
          orderStatus: {
            type: String,
            enum: ["pending", "shipped", "delivered", "cancelled"],
            required: true,
          },
          paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed"],
            required: true,
          },
          delivery: {
            address: {
              street: { type: String, required: true },
              city: { type: String, required: true },
              state: { type: String, required: true },
              postalCode: { type: String, required: true },
              country: { type: String, required: true },
              location: {
                type: {
                  type: String,
                  enum: ["Point"],
                  required: true,
                },
                coordinates: {
                  type: [Number],
                  required: true,
                },
              },
            },
            pickupAddress: {
              street: { type: String, required: true },
              city: { type: String, required: true },
              state: { type: String, required: true },
              postalCode: { type: String, required: true },
              country: { type: String, required: true },
              location: {
                type: {
                  type: String,
                  enum: ["Point"],
                  required: true,
                },
                coordinates: {
                  type: [Number],
                  required: true,
                },
              },
            },
            destinationAddress: {
              street: { type: String, required: true },
              city: { type: String, required: true },
              state: { type: String, required: true },
              postalCode: { type: String, required: true },
              country: { type: String, required: true },
              location: {
                type: {
                  type: String,
                  enum: ["Point"],
                  required: true,
                },
                coordinates: {
                  type: [Number],
                  required: true,
                },
              },
            },
            deliveryStatus: {
              type: String,
              enum: ["preparing", "in_transit", "delivered"],
              required: true,
            },
            trackingNumber: { type: String, required: true },
            courier: { type: String, required: true },
          },
        },
        { timestamps: true }
      )
    );
  }

  getModel() {
    return this.model;
  }
}

export default new OrderModel();
