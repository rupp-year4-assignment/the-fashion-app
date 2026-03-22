import { PaymentResponseDTO } from "@dtos/request/payment.request";
import { IPayment } from "@models/payment";

export  class PaymentResponseMapper {
    static toResponse(payment: IPayment, extra: Partial<PaymentResponseDTO> = {}): PaymentResponseDTO { 
        return {
            id: payment._id.toString(),
            orderId: payment.orderId.toString(),
            amount: payment.amount,
            currency: payment.currency,
            method: payment.method,
            status: payment.status,
            stripeCheckoutSessionId: payment.stripeCheckoutSessionId,
            stripePaymentIntentId: payment.stripePaymentIntentId,
            khqrString: payment.khqrString,
            md5Hash: payment.md5Hash,
            transactionRef: payment.transactionRef,
            cardLast4: payment.cardLast4,
            cardNetwork: payment.cardNetwork,
            paidAt: payment.paidAt,
            expiresAt: payment.expiresAt,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            ...extra,
        };
    }
}
