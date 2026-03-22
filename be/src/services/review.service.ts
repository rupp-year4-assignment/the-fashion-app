import {
  ProductReviewResponseDTO,
  UpsertProductReviewDTO,
} from "@dtos/request/review.request";

export default interface ReviewService {
  getProductReviews(productId: string): Promise<ProductReviewResponseDTO[]>;
  upsertProductReview(
    userId: string,
    productId: string,
    payload: UpsertProductReviewDTO
  ): Promise<ProductReviewResponseDTO>;
}
