import { IUser } from "@models/user";
import reviewService from "@services/impl/review.service.impl";
import { Request, Response } from "express";

class ReviewController {
  listProductReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;
      const reviews = await reviewService.getProductReviews(productId);

      res.status(200).json({
        success: true,
        message: "Product reviews fetched successfully.",
        data: reviews,
      });
    } catch (error: any) {
      res.status(error?.status || 500).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  };

  upsertProductReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const currentUser = (req as any).user as IUser | undefined;
      if (!currentUser?._id) {
        res.status(403).json({
          success: false,
          message: "Forbidden",
        });
        return;
      }

      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;
      const review = await reviewService.upsertProductReview(
        currentUser._id.toString(),
        productId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Review saved successfully.",
        data: review,
      });
    } catch (error: any) {
      res.status(error?.status || 500).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  };
}

export default new ReviewController();
