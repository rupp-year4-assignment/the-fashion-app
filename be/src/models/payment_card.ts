import { CardNetwork } from "@dtos/request/card.request";
import mongoose, { Document, Model } from "mongoose";

export interface IPaymentCard extends Document {
  userId: mongoose.Types.ObjectId;
  holderName: string;
  network: CardNetwork;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardHash: string;
  cvvHash: string;
  fingerprintHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class PaymentCardModel {
  private model: Model<IPaymentCard>;

  constructor() {
    this.model = mongoose.model<IPaymentCard>(
      "PaymentCard",
      new mongoose.Schema(
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
          },
          holderName: { type: String, required: true, trim: true },
          network: {
            type: String,
            enum: ["VISA", "MASTERCARD", "UNIONPAY"],
            required: true,
          },
          last4: { type: String, required: true },
          expiryMonth: { type: Number, required: true },
          expiryYear: { type: Number, required: true },
          cardHash: { type: String, required: true },
          cvvHash: { type: String, required: true },
          fingerprintHash: { type: String, required: true },
          isActive: { type: Boolean, default: true, index: true },
        },
        { timestamps: true }
      )
    );
  }

  getModel(): Model<IPaymentCard> {
    return this.model;
  }
}

export default new PaymentCardModel();
