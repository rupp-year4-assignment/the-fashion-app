import { Router } from "express";
import productController from "@controllers/product.controller";
import reviewController from "@controllers/review.controller";
import { hasRoles } from "@middlewares/hasRoles.middleware";
import validationMiddleware, {
  ValidationMiddleware,
} from "@middlewares/validation.middleware";
const router = Router();

router.post("/products", hasRoles("admin"), productController.createProduct);
router.get("/products", productController.getAllProducts);
router.get(
  "/products/:productId/reviews",
  reviewController.listProductReviews
);
router.post(
  "/products/:productId/reviews",
  validationMiddleware.productReview,
  ValidationMiddleware,
  reviewController.upsertProductReview
);
router.get("/products/:id", productController.getProductById);
router.put("/products/:id", hasRoles("admin"), productController.updateProduct);
router.delete("/products/:id", hasRoles("admin"), productController.deleteProduct);
export default router;
