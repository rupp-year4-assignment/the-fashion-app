import { CardNetwork } from "./card.request";

export type PaymentMethod =
  | "BAKONG"
  | "CREDIT_CARD"
  | "UNION_PAY"
  | "STRIPE";

export type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED"
  | "SUCCEEDED"
  | "REFUNDED";

export interface CreatePaymentDTO {
  orderId: string;
  method: PaymentMethod;
  amount: number;
  currency: "KHR" | "USD";
  expiesAt?: Date;
  expiresAt?: Date;
  savedCardId?: string;
}

export interface CreateStripeCheckoutSessionDTO {
  orderId: string;
}

export interface UpdatePaymentStatusDTO {
  status: PaymentStatus;
  transactionRef?: string;
  paidAt?: Date;
}

export interface PaymentResponseDTO {
  id: string;
  orderId: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  method: PaymentMethod;
  amount: number;
  currency: "KHR" | "USD";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  khqrString?: string;
  md5Hash?: string;
  transactionRef?: string;
  cardLast4?: string;
  cardNetwork?: CardNetwork;
  status: PaymentStatus;
  paidAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentFilterDTO {
  status?: PaymentStatus;
  method?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface GenerateKHQRDTO {
  amount: number;
  currency: "KHR" | "USD";
  orderId: string;
}

export interface VerifyPaymentDTO {
  khqrString: string;
  transactionRef: string;
  orderId: string;
}
