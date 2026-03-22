"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripeClient = getStripeClient;
exports.getStripeWebhookSecret = getStripeWebhookSecret;
const stripe_1 = __importDefault(require("stripe"));
let stripeClient = null;
function getStripeClient() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not configured.");
    }
    if (!stripeClient) {
        stripeClient = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
    }
    return stripeClient;
}
function getStripeWebhookSecret() {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || secret.trim().length === 0) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
    }
    return secret.trim();
}
