export interface UpsertProductReviewDTO {
  orderId: string;
  rating: number;
  comment: string;
}

export interface ProductReviewResponseDTO {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt?: Date;
  updatedAt?: Date;
}
