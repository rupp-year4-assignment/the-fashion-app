import {
  ProductReviewResponseDTO,
  UpsertProductReviewDTO,
} from "@dtos/request/review.request";
import BadRequestException from "@exceptions/badRequest.exception";
import NotFoundException from "@exceptions/notFound.exception";
import OrderModel from "@models/orders";
import ProductModel from "@models/product";
import ReviewModel from "@models/review";
import UserModel from "@models/user";
import ReviewService from "@services/review.service";
import mongoose from "mongoose";

class ReviewServiceImpl implements ReviewService {
  private reviewModel = ReviewModel.getModel();
  private orderModel = OrderModel.getModel();
  private productModel = ProductModel.getModel();
  private userModel = UserModel.getModel();

  private async mapReview(review: any): Promise<ProductReviewResponseDTO> {
    const user: any = await this.userModel
      .findById(review.userId)
      .select("fullName firstName lastName")
      .lean();

    const fullName =
      user?.fullName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      "Customer";

    return {
      id: review._id.toString(),
      userId: review.userId.toString(),
      productId: review.productId.toString(),
      orderId: review.orderId.toString(),
      rating: Number(review.rating || 0),
      comment: review.comment || "",
      userName: fullName,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  async getProductReviews(productId: string): Promise<ProductReviewResponseDTO[]> {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new BadRequestException("Invalid product id.");
    }

    const reviews = await this.reviewModel
      .find({ productId: new mongoose.Types.ObjectId(productId) } as any)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(20)
      .lean();

    return Promise.all(reviews.map((review) => this.mapReview(review)));
  }

  async upsertProductReview(
    userId: string,
    productId: string,
    payload: UpsertProductReviewDTO
  ): Promise<ProductReviewResponseDTO> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid user id.");
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new BadRequestException("Invalid product id.");
    }

    if (!mongoose.Types.ObjectId.isValid(payload.orderId)) {
      throw new BadRequestException("Invalid order id.");
    }

    const [product, order] = await Promise.all([
      this.productModel.findById(productId),
      this.orderModel.findById(payload.orderId),
    ]);

    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    if (order.userId.toString() !== userId) {
      throw new BadRequestException(
        "You can only review products from your own orders."
      );
    }

    const isDelivered =
      order.orderStatus === "delivered" ||
      order.delivery?.deliveryStatus === "delivered";

    if (!isDelivered) {
      throw new BadRequestException(
        "You can review a product only after the order is delivered."
      );
    }

    const purchasedProduct = Array.isArray(order.items)
      ? order.items.find((item: any) => item.productId.toString() === productId)
      : null;

    if (!purchasedProduct) {
      throw new BadRequestException(
        "This product does not belong to the selected order."
      );
    }

    const review = await this.reviewModel.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        productId: new mongoose.Types.ObjectId(productId),
      } as any,
      {
        $set: {
          orderId: new mongoose.Types.ObjectId(payload.orderId),
          rating: payload.rating,
          comment: payload.comment.trim(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return this.mapReview(review);
  }
}

export default new ReviewServiceImpl();
