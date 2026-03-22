import { CardNetwork } from "@dtos/request/card.request";
import { PaymentMethod } from "@dtos/request/payment.request";
import mongoose, { Document, Model } from "mongoose";

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;

  method: PaymentMethod;
  amount: number;
  currency: "KHR" | "USD";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;

  khqrString?: string; // Generated KHQR payload
  md5Hash?: string; // MD5 hash of the KHQR for verification
  transactionRef?: string; // Bank reference after payment
  cardId?: mongoose.Types.ObjectId;
  cardLast4?: string;
  cardNetwork?: CardNetwork;

  status:
    | "CREATED"
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "EXPIRED"
    | "SUCCEEDED"
    | "REFUNDED";

  paidAt?: Date;
  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

class PaymentModel {
  private model: Model<IPayment>;

  constructor() {
    this.model = mongoose.model<IPayment>(
      "Payment",
      new mongoose.Schema(
        {
          orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
          },

          method: {
            type: String,
            enum: ["BAKONG", "CREDIT_CARD", "UNION_PAY", "STRIPE"],
            required: true,
          },

          amount: { type: Number, required: true },
          currency: {
            type: String,
            enum: ["KHR", "USD"],
            default: "KHR",
          },
          stripeCheckoutSessionId: {
            type: String,
            unique: true,
            sparse: true,
          },
          stripePaymentIntentId: {
            type: String,
            index: true,
            sparse: true,
          },

          khqrString: { type: String },
          md5Hash: { type: String },

          transactionRef: { type: String },
          cardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PaymentCard",
          },
          cardLast4: { type: String },
          cardNetwork: {
            type: String,
            enum: ["VISA", "MASTERCARD", "UNIONPAY"],
          },

          status: {
            type: String,
            enum: [
              "CREATED",
              "PENDING",
              "COMPLETED",
              "FAILED",
              "EXPIRED",
              "SUCCEEDED",
              "REFUNDED",
            ],
            default: "CREATED",
          },

          paidAt: { type: Date },
          expiresAt: { type: Date },
        },
        { timestamps: true }
      )
    );
  }

  getModel(): Model<IPayment> {
    return this.model;
  }
}

export default new PaymentModel();
