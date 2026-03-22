import mongoose, { Document, Model, ObjectId } from "mongoose";

export interface IReview extends Document {
  userId: ObjectId;
  productId: ObjectId;
  orderId: ObjectId;
  rating: number;
  comment: string;
}

class ReviewModel {
  private model: Model<IReview>;

  constructor() {
    const reviewSchema = new mongoose.Schema(
      {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
      },
      { timestamps: true }
    );

    reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

    this.model = mongoose.model<IReview>("Review", reviewSchema);
  }

  getModel(): Model<IReview> {
    return this.model;
  }
}

export default new ReviewModel();
