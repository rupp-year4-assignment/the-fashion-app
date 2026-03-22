import { Router } from "express";
import asyncHandler from "@utils/asyncHandler";
import adminController from "@controllers/admin.controller";
import { hasRoles } from "@middlewares/hasRoles.middleware";
import validationMiddleware, { ValidationMiddleware } from "@middlewares/validation.middleware";

const router = Router();

router.get("/dashboard", hasRoles("admin"), asyncHandler(adminController.dashboard));
router.get("/customers", hasRoles("admin"), asyncHandler(adminController.customers));
router.get("/customers/:id", hasRoles("admin"), asyncHandler(adminController.customerById));
router.patch(
  "/orders/:id/status",
  hasRoles("admin"),
  validationMiddleware.adminOrderStatus,
  ValidationMiddleware,
  asyncHandler(adminController.updateOrderStatus),
);
router.patch(
  "/payments/:id/status",
  hasRoles("admin"),
  validationMiddleware.adminPaymentStatus,
  ValidationMiddleware,
  asyncHandler(adminController.updatePaymentStatus),
);

export default router;
