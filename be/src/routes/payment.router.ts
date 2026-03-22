import { Router } from "express";
import paymentController from "@controllers/payment.controller";
import { hasRoles } from "@middlewares/hasRoles.middleware";

const route = Router();

route.post("/payment", paymentController.createPayment);
route.post(
  "/payments/create-checkout-session",
  paymentController.createStripeCheckoutSession
);

route.get("/payment/order/:orderId", paymentController.getPaymentByOrderId);

route.get("/payment/:paymentId", hasRoles("admin"), paymentController.getPaymentById);

route.get("/payment", hasRoles("admin"), paymentController.getAllPayments);

route.patch(
  "/payment/:paymentId/status",
  hasRoles("admin"),
  paymentController.updatePaymentStatus
);

route.post("/payment/:paymentId/complete", paymentController.completePayment);

route.post("/payment/:paymentId/fail", paymentController.failPayment);

route.post("/payment/:paymentId/expire", paymentController.expirePayment);

route.post("/payment/generate-khqr", paymentController.generateKHQR);

route.post("/payment/verify", paymentController.verifyPayment);

route.post("/payment/check-expired", paymentController.checkExpiredPayments);

export default route;
