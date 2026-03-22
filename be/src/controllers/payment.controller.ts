import { IUser } from "@models/user";
import paymentService from "@services/impl/payment.service.impl";
import { Request, Response } from "express";
import Stripe from "stripe";
import { getStripeClient, getStripeWebhookSecret } from "../config/stripe.config";

class PaymentController {
  private sendError(res: Response, error: any) {
    const status =
      typeof error?.status === "number" && error.status >= 400
        ? error.status
        : 500;

    res.status(status).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }

  private getParam(
    req: Request,
    key: "paymentId" | "orderId"
  ): string | null {
    const value = req.params[key];
    if (typeof value !== "string" || value.trim().length === 0) {
      return null;
    }
    return value;
  }

  // Create new payment
  createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const payment = await paymentService.createPayment(req.body);
      res.status(201).json({
        success: true,
        message: "Payment successfully",
        data: payment,
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  createStripeCheckoutSession = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const orderId =
        typeof req.body?.orderId === "string" ? req.body.orderId.trim() : "";

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: "orderId is required.",
        });
        return;
      }

      const currentUser = (req as any).user as IUser | undefined;
      const result = await paymentService.createStripeCheckoutSession({
        orderId,
        userId: currentUser?._id?.toString(),
      });

      res.status(201).json({
        success: true,
        checkoutUrl: result.checkoutUrl,
        data: result.payment,
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  stripeWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers["stripe-signature"];

      if (typeof signature !== "string" || signature.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Missing Stripe signature.",
        });
        return;
      }

      const stripe = getStripeClient();
      const event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        getStripeWebhookSecret()
      );

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await paymentService.handleStripeCheckoutCompleted({
            sessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id,
            orderId: session.metadata?.orderId ?? session.client_reference_id,
          });
          break;
        }
        case "checkout.session.expired": {
          const session = event.data.object as Stripe.Checkout.Session;
          await paymentService.handleStripeCheckoutExpired({
            sessionId: session.id,
            orderId: session.metadata?.orderId ?? session.client_reference_id,
          });
          break;
        }
        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;
          await paymentService.handleStripeRefund({
            paymentIntentId:
              typeof charge.payment_intent === "string"
                ? charge.payment_intent
                : charge.payment_intent?.id,
          });
          break;
        }
        default:
          break;
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      const isStripeSignatureError =
        error instanceof Stripe.errors.StripeSignatureVerificationError;

      res.status(isStripeSignatureError ? 400 : 500).json({
        success: false,
        message:
          error?.message ||
          (isStripeSignatureError
            ? "Invalid Stripe webhook signature."
            : "Internal Server Error"),
      });
    }
  };

  // Get payment by ID
  getPaymentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.getParam(req, "paymentId");
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Invalid payment id.",
        });
        return;
      }

      const payment = await paymentService.getPaymentById(id);
      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Payment not found. ",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  // Get payment by order ID
  getPaymentByOrderId = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.getParam(req, "orderId");
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Invalid order id.",
        });
        return;
      }

      const payment = await paymentService.getPaymentByOrderId(id);
      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Payment not found for this order",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  // Get all payments with filters
  getAllPayments = async (req: Request, res: Response): Promise<void> => {
    try {
      const payments = await paymentService.getAllPayments(req.query);
      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  // Update payment status
  updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.getParam(req, "paymentId");
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Invalid payment id.",
        });
        return;
      }

      const payment = await paymentService.updatePaymentStatus(id, req.body);
      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Payment not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Payment status updated successfully",
        data: payment,
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  // Complete payment
  completePayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.getParam(req, "paymentId");
      const { transactionRef } = req.body;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Invalid payment id.",
        });
        return;
      }
      const payment = await paymentService.completePayment(id, transactionRef);
      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Payment not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Payment completed successfully",
        data: payment,
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  // Fail payment
  failPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.getParam(req, "paymentId");
      const { reason } = req.body;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Invalid payment id.",
        });
        return;
      }
      const payment = await paymentService.failPayment(id, reason);
      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Payment not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Payment marked as failed",
        data: payment,
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  // Expire payment
  expirePayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.getParam(req, "paymentId");
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Invalid payment id.",
        });
        return;
      }
      const payment = await paymentService.expirePayment(id);
      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Payment not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Payment marked as expired",
        data: payment,
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  // Generate KHQR
  generateKHQR = async (req: Request, res: Response): Promise<void> => {
    try {
      const qrString = await paymentService.generateKHQR(req.body);
      res.status(200).json({
        success: true,
        data: { khqrString: qrString },
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  // Verify payment
  verifyPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const isVerified = await paymentService.verifyPayment(req.body);
      res.status(200).json({
        success: true,
        verified: isVerified,
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  // Check expired payments (background job)
  checkExpiredPayments = async (req: Request, res: Response): Promise<void> => {
    try {
      await paymentService.checkExpiredPayments();
      res.status(200).json({
        success: true,
        message: "Expired payments checked and updated",
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  };
}

export default new PaymentController();
