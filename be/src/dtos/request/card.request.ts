export type CardNetwork = "VISA" | "MASTERCARD" | "UNIONPAY";

export interface CreatePaymentCardDTO {
  holderName: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  network?: CardNetwork;
}

export interface PaymentCardResponseDTO {
  id: string;
  holderName: string;
  network: CardNetwork;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
