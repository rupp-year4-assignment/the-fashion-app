"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class OrderModel {
    constructor() {
        this.model = mongoose_1.default.model("Order", new mongoose_1.default.Schema({
            orderNumber: { type: String, required: true, unique: true },
            userId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
            items: [
                {
                    productId: {
                        type: mongoose_1.default.Schema.Types.ObjectId,
                        required: true,
                    },
                    variantId: {
                        type: mongoose_1.default.Schema.Types.ObjectId,
                        required: true,
                    },
                    size: { type: String, required: true },
                    color: { type: String, required: true },
                    price: { type: Number, required: true },
                    quantity: { type: Number, required: true },
                    productName: { type: String, required: true },
                    image: { type: String, required: false },
                },
            ],
            totalAmount: { type: Number, required: true },
            orderStatus: {
                type: String,
                enum: ["pending", "shipped", "delivered", "cancelled"],
                required: true,
            },
            paymentStatus: {
                type: String,
                enum: ["pending", "completed", "failed"],
                required: true,
            },
            delivery: {
                address: {
                    street: { type: String, required: true },
                    city: { type: String, required: true },
                    state: { type: String, required: true },
                    postalCode: { type: String, required: true },
                    country: { type: String, required: true },
                    location: {
                        type: {
                            type: String,
                            enum: ["Point"],
                            required: true,
                        },
                        coordinates: {
                            type: [Number],
                            required: true,
                        },
                    },
                },
                pickupAddress: {
                    street: { type: String, required: true },
                    city: { type: String, required: true },
                    state: { type: String, required: true },
                    postalCode: { type: String, required: true },
                    country: { type: String, required: true },
                    location: {
                        type: {
                            type: String,
                            enum: ["Point"],
                            required: true,
                        },
                        coordinates: {
                            type: [Number],
                            required: true,
                        },
                    },
                },
                destinationAddress: {
                    street: { type: String, required: true },
                    city: { type: String, required: true },
                    state: { type: String, required: true },
                    postalCode: { type: String, required: true },
                    country: { type: String, required: true },
                    location: {
                        type: {
                            type: String,
                            enum: ["Point"],
                            required: true,
                        },
                        coordinates: {
                            type: [Number],
                            required: true,
                        },
                    },
                },
                deliveryStatus: {
                    type: String,
                    enum: ["preparing", "in_transit", "delivered"],
                    required: true,
                },
                trackingNumber: { type: String, required: true },
                courier: { type: String, required: true },
            },
        }, { timestamps: true }));
    }
    getModel() {
        return this.model;
    }
}
exports.default = new OrderModel();
