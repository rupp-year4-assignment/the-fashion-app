"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const payment_card_1 = __importDefault(require("../../models/payment_card"));
const badRequest_exception_1 = __importDefault(require("../../exceptions/badRequest.exception"));
const notFound_exception_1 = __importDefault(require("../../exceptions/notFound.exception"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = require("mongoose");
class CardServiceImpl {
    constructor() {
        this.model = payment_card_1.default.getModel();
    }
    sanitizeCardNumber(value) {
        return value.replace(/[^0-9]/g, "");
    }
    sanitizeDigits(value) {
        return value.replace(/[^0-9]/g, "");
    }
    normalizeExpiryYear(year) {
        return year < 100 ? 2000 + year : year;
    }
    detectNetwork(cardNumber) {
        if (cardNumber.startsWith("62"))
            return "UNIONPAY";
        if (cardNumber.startsWith("4"))
            return "VISA";
        const mastercardRegex = /^(5[1-5][0-9]{14}|2(2(2[1-9]|[3-9][0-9])|[3-6][0-9]{2}|7([01][0-9]|20))[0-9]{12})$/;
        if (mastercardRegex.test(cardNumber))
            return "MASTERCARD";
        return null;
    }
    assertValidCardInput(payload) {
        var _a;
        const cardNumber = this.sanitizeCardNumber(payload.cardNumber);
        const cvv = this.sanitizeDigits(payload.cvv);
        const expiryYear = this.normalizeExpiryYear(payload.expiryYear);
        if (cardNumber.length < 13 || cardNumber.length > 19) {
            throw new badRequest_exception_1.default("Invalid card number.");
        }
        if (payload.expiryMonth < 1 || payload.expiryMonth > 12) {
            throw new badRequest_exception_1.default("Invalid expiry month.");
        }
        if (cvv.length < 3 || cvv.length > 4) {
            throw new badRequest_exception_1.default("Invalid CVV.");
        }
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        if (expiryYear < currentYear ||
            (expiryYear === currentYear && payload.expiryMonth < currentMonth)) {
            throw new badRequest_exception_1.default("Card has expired.");
        }
        const detected = this.detectNetwork(cardNumber);
        if (!detected && !payload.network) {
            throw new badRequest_exception_1.default("Unsupported card network.");
        }
        if (payload.network && detected && payload.network !== detected) {
            throw new badRequest_exception_1.default("Card network does not match card number.");
        }
        return {
            cardNumber,
            cvv,
            network: (_a = payload.network) !== null && _a !== void 0 ? _a : detected,
            expiryYear,
        };
    }
    fingerprintOf(input) {
        const pepper = process.env.CARD_HASH_PEPPER || "fashion-app-card-pepper";
        const raw = [
            input.userId,
            input.cardNumber,
            input.expiryMonth,
            input.expiryYear,
            input.network,
            pepper,
        ].join("|");
        return crypto_1.default.createHash("sha256").update(raw).digest("hex");
    }
    toResponse(doc) {
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
    getCardsByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield this.model
                .find({ userId: userId, isActive: true })
                .sort({ createdAt: -1 })
                .exec();
            return docs.map((card) => this.toResponse(card));
        });
    }
    createCard(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cardNumber, cvv, network, expiryYear } = this.assertValidCardInput(payload);
            const last4 = cardNumber.substring(cardNumber.length - 4);
            const normalizedUserId = new mongoose_1.Types.ObjectId(userId.toString());
            const fingerprintHash = this.fingerprintOf({
                userId: normalizedUserId.toString(),
                cardNumber,
                expiryMonth: payload.expiryMonth,
                expiryYear,
                network,
            });
            const existing = yield this.model.findOne({
                userId: normalizedUserId,
                fingerprintHash,
                isActive: true,
            });
            if (existing) {
                return this.toResponse(existing);
            }
            const [cardHash, cvvHash] = yield Promise.all([
                bcryptjs_1.default.hash(cardNumber, 10),
                bcryptjs_1.default.hash(cvv, 10),
            ]);
            const created = yield this.model.create({
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
            });
            return this.toResponse(created);
        });
    }
    removeCard(userId, cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedUserId = new mongoose_1.Types.ObjectId(userId.toString());
            const update = yield this.model.findOneAndUpdate({
                _id: new mongoose_1.Types.ObjectId(cardId),
                userId: normalizedUserId,
            }, { isActive: false }, { new: true });
            if (!update) {
                throw new notFound_exception_1.default("Card not found.");
            }
        });
    }
}
exports.default = CardServiceImpl;
