import { Router } from "express";
import { hasRoles } from "@middlewares/hasRoles.middleware";
import asyncHandler from "@utils/asyncHandler";
import uploadController from "@controllers/upload.controller";
import { productImageUpload } from "../config/upload.config";

const router = Router();

router.post(
  "/uploads/products",
  hasRoles("admin"),
  productImageUpload.single("file"),
  asyncHandler(uploadController.uploadProductImage),
);

export default router;
