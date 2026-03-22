import {
  CreatePaymentDTO,
  CreateStripeCheckoutSessionDTO,
  UpdatePaymentStatusDTO,
  PaymentResponseDTO,
  PaymentFilterDTO,
  GenerateKHQRDTO,
  VerifyPaymentDTO,
} from "../dtos/request/payment.request";
import { IPayment } from "../models/payment";

export default interface PaymentService {
  createStripeCheckoutSession(
    data: CreateStripeCheckoutSessionDTO & { userId?: string }
  ): Promise<{ checkoutUrl: string; payment: PaymentResponseDTO }>;

  handleStripeCheckoutCompleted(payload: {
    sessionId: string;
    paymentIntentId?: string | null;
    orderId?: string | null;
  }): Promise<void>;

  handleStripeCheckoutExpired(payload: {
    sessionId: string;
    orderId?: string | null;
  }): Promise<void>;

  handleStripeRefund(payload: {
    paymentIntentId?: string | null;
  }): Promise<void>;

  // Create new payment
  createPayment(data: CreatePaymentDTO): Promise<PaymentResponseDTO>;

  // Get payment by ID
  getPaymentById(paymentId: string): Promise<IPayment | null>;

  // Get payment by order ID
  getPaymentByOrderId(orderId: string): Promise<PaymentResponseDTO | null>;

  // Get all payments with filters
  getAllPayments(filter?: PaymentFilterDTO): Promise<PaymentResponseDTO[]>;

  // Update payment status
  updatePaymentStatus(
    paymentId: string,
    data: UpdatePaymentStatusDTO
  ): Promise<PaymentResponseDTO | null>;

  // Generate KHQR code
  generateKHQR(data: GenerateKHQRDTO): Promise<string>;

  // Verify payment
  verifyPayment(data: VerifyPaymentDTO): Promise<boolean>;

  // Mark payment as completed
  completePayment(
    paymentId: string,
    transactionRef: string
  ): Promise<PaymentResponseDTO | null>;

  // Mark payment as failed
  failPayment(
    paymentId: string,
    reason?: string
  ): Promise<PaymentResponseDTO | null>;

  // Mark payment as expired
  expirePayment(paymentId: string): Promise<PaymentResponseDTO | null>;

  // Check and expire old payments
  checkExpiredPayments(): Promise<void>;
}
