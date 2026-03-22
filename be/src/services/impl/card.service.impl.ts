import {
  CardNetwork,
  CreatePaymentCardDTO,
  PaymentCardResponseDTO,
} from "@dtos/request/card.request";
import PaymentCardModel, { IPaymentCard } from "@models/payment_card";
import { CardService } from "@services/card.service";
import BadRequestException from "@exceptions/badRequest.exception";
import NotFoundException from "@exceptions/notFound.exception";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ObjectId, Types } from "mongoose";

class CardServiceImpl implements CardService {
  private model = PaymentCardModel.getModel();

  private sanitizeCardNumber(value: string): string {
    return value.replace(/[^0-9]/g, "");
  }

  private sanitizeDigits(value: string): string {
    return value.replace(/[^0-9]/g, "");
  }

  private normalizeExpiryYear(year: number): number {
    return year < 100 ? 2000 + year : year;
  }

  private detectNetwork(cardNumber: string): CardNetwork | null {
    if (cardNumber.startsWith("62")) return "UNIONPAY";
    if (cardNumber.startsWith("4")) return "VISA";

    const mastercardRegex =
      /^(5[1-5][0-9]{14}|2(2(2[1-9]|[3-9][0-9])|[3-6][0-9]{2}|7([01][0-9]|20))[0-9]{12})$/;

    if (mastercardRegex.test(cardNumber)) return "MASTERCARD";
    return null;
  }

  private assertValidCardInput(payload: CreatePaymentCardDTO): {
    cardNumber: string;
    cvv: string;
    network: CardNetwork;
    expiryYear: number;
  } {
    const cardNumber = this.sanitizeCardNumber(payload.cardNumber);
    const cvv = this.sanitizeDigits(payload.cvv);
    const expiryYear = this.normalizeExpiryYear(payload.expiryYear);

    if (cardNumber.length < 13 || cardNumber.length > 19) {
      throw new BadRequestException("Invalid card number.");
    }

    if (payload.expiryMonth < 1 || payload.expiryMonth > 12) {
      throw new BadRequestException("Invalid expiry month.");
    }

    if (cvv.length < 3 || cvv.length > 4) {
      throw new BadRequestException("Invalid CVV.");
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    if (
      expiryYear < currentYear ||
      (expiryYear === currentYear && payload.expiryMonth < currentMonth)
    ) {
      throw new BadRequestException("Card has expired.");
    }

    const detected = this.detectNetwork(cardNumber);
    if (!detected && !payload.network) {
      throw new BadRequestException("Unsupported card network.");
    }

    if (payload.network && detected && payload.network !== detected) {
      throw new BadRequestException("Card network does not match card number.");
    }

    return {
      cardNumber,
      cvv,
      network: payload.network ?? detected!,
      expiryYear,
    };
  }

  private fingerprintOf(input: {
    userId: string;
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    network: CardNetwork;
  }): string {
    const pepper = process.env.CARD_HASH_PEPPER || "fashion-app-card-pepper";
    const raw = [
      input.userId,
      input.cardNumber,
      input.expiryMonth,
      input.expiryYear,
      input.network,
      pepper,
    ].join("|");

    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  private toResponse(doc: IPaymentCard): PaymentCardResponseDTO {
    return {
      id: doc._id.toString(),
      holderName: doc.holderName,
      network: doc.network,
      last4: doc.last4,
      expiryMonth: doc.expiryMonth,
      expiryYear: doc.expiryYear,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async getCardsByUser(userId: ObjectId): Promise<PaymentCardResponseDTO[]> {
    const docs = await this.model
      .find({ userId: userId as any, isActive: true } as any)
      .sort({ createdAt: -1 })
      .exec();

    return docs.map((card) => this.toResponse(card));
  }

  async createCard(
    userId: ObjectId,
    payload: CreatePaymentCardDTO
  ): Promise<PaymentCardResponseDTO> {
    const { cardNumber, cvv, network, expiryYear } =
      this.assertValidCardInput(payload);
    const last4 = cardNumber.substring(cardNumber.length - 4);
    const normalizedUserId = new Types.ObjectId(userId.toString());

    const fingerprintHash = this.fingerprintOf({
      userId: normalizedUserId.toString(),
      cardNumber,
      expiryMonth: payload.expiryMonth,
      expiryYear,
      network,
    });

    const existing = await this.model.findOne({
      userId: normalizedUserId as any,
      fingerprintHash,
      isActive: true,
    } as any);

    if (existing) {
      return this.toResponse(existing);
    }

    const [cardHash, cvvHash] = await Promise.all([
      bcrypt.hash(cardNumber, 10),
      bcrypt.hash(cvv, 10),
    ]);

    const created = await this.model.create({
      userId: normalizedUserId,
      holderName: payload.holderName.trim(),
      network,
      last4,
      expiryMonth: payload.expiryMonth,
      expiryYear,
      cardHash,
      cvvHash,
      fingerprintHash,
      isActive: true,
    } as any);

    return this.toResponse(created);
  }

  async removeCard(userId: ObjectId, cardId: string): Promise<void> {
    const normalizedUserId = new Types.ObjectId(userId.toString());

    const update = await this.model.findOneAndUpdate(
      {
        _id: new Types.ObjectId(cardId),
        userId: normalizedUserId as any,
      } as any,
      { isActive: false } as any,
      { new: true }
    );

    if (!update) {
      throw new NotFoundException("Card not found.");
    }
  }
}

export default CardServiceImpl;
