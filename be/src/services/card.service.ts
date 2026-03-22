import {
  CreatePaymentCardDTO,
  PaymentCardResponseDTO,
} from "@dtos/request/card.request";
import { ObjectId } from "mongoose";

export interface CardService {
  getCardsByUser(userId: ObjectId): Promise<PaymentCardResponseDTO[]>;
  createCard(
    userId: ObjectId,
    payload: CreatePaymentCardDTO
  ): Promise<PaymentCardResponseDTO>;
  removeCard(userId: ObjectId, cardId: string): Promise<void>;
}
