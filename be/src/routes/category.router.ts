import { Router } from "express";
import asyncHandler from "@utils/asyncHandler";
import categoryController from "@controllers/category.controller";
import validationMiddleware, { ValidationMiddleware } from "@middlewares/validation.middleware";
import { hasRoles } from "@middlewares/hasRoles.middleware";

const router = Router();

router.get("/categories", hasRoles("admin"), asyncHandler(categoryController.list));
router.get("/categories/:id", hasRoles("admin"), asyncHandler(categoryController.getById));
router.post(
  "/categories",
  hasRoles("admin"),
  validationMiddleware.categoryCreate,
  ValidationMiddleware,
  asyncHandler(categoryController.create),
);
router.patch(
  "/categories/:id",
  hasRoles("admin"),
  validationMiddleware.categoryUpdate,
  ValidationMiddleware,
  asyncHandler(categoryController.update),
);
router.delete(
  "/categories/:id",
  hasRoles("admin"),
  validationMiddleware.categoryDelete,
  ValidationMiddleware,
  asyncHandler(categoryController.remove),
);

export default router;
