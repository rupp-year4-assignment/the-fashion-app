"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class UserToken {
    constructor() {
        this.model = mongoose_1.default.model("UserToken", new mongoose_1.default.Schema({
            tokenHash: { type: String, required: true },
            expiredAt: { type: Date, required: true },
            userId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
        }, { timestamps: true }));
    }
    getModel() {
        return this.model;
    }
}
exports.default = new UserToken();
