"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class ShopAddressModel {
    constructor() {
        this.model = mongoose_1.default.model("shop_addresses", new mongoose_1.default.Schema({
            label: { type: String, required: true, trim: true, default: "Main Shop" },
            street: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            state: { type: String, required: true, trim: true },
            postalCode: { type: String, required: true, trim: true },
            country: { type: String, required: true, trim: true },
            location: {
                type: {
                    type: String,
                    enum: ["Point"],
                    required: true,
                    default: "Point",
                },
                coordinates: {
                    type: [Number],
                    required: true,
                },
            },
            isDefault: { type: Boolean, default: true, index: true },
            isActive: { type: Boolean, default: true, index: true },
        }, { timestamps: true }));
        this.model.schema.index({ location: "2dsphere" });
    }
    getModel() {
        return this.model;
    }
}
exports.default = new ShopAddressModel();
