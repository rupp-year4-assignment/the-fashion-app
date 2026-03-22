"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class PromotionModel {
    constructor() {
        this.model = mongoose_1.default.model("Promotion", new mongoose_1.default.Schema({
            code: { type: String, required: true },
            discountValue: { type: Number, required: true },
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
            isActive: { type: Boolean, required: true },
        }, { timestamps: true }));
    }
    getModel() {
        return this.model;
    }
}
exports.default = new PromotionModel();
