"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class PaymentCardModel {
    constructor() {
        this.model = mongoose_1.default.model("PaymentCard", new mongoose_1.default.Schema({
            userId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true,
            },
            holderName: { type: String, required: true, trim: true },
            network: {
                type: String,
                enum: ["VISA", "MASTERCARD", "UNIONPAY"],
                required: true,
            },
            last4: { type: String, required: true },
            expiryMonth: { type: Number, required: true },
            expiryYear: { type: Number, required: true },
            cardHash: { type: String, required: true },
            cvvHash: { type: String, required: true },
            fingerprintHash: { type: String, required: true },
            isActive: { type: Boolean, default: true, index: true },
        }, { timestamps: true }));
    }
    getModel() {
        return this.model;
    }
}
exports.default = new PaymentCardModel();
