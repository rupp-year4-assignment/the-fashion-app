"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
class ProductModel {
    constructor() {
        const productSchema = new mongoose_1.Schema({
            productId: {
                type: String,
                required: true,
                unique: true,
                default: () => crypto_1.default.randomUUID(),
            },
            name: { type: String, required: true },
            description: { type: String, required: true },
            brand: { type: String, required: true },
            category: { type: String, required: true },
            status: {
                type: String,
                required: true,
                enum: ["available", "out_of_stock"],
            },
            variants: [
                {
                    variantId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
                    size: { type: String, required: true },
                    color: { type: String, required: true },
                    sku: { type: String, required: true, unique: true },
                    price: { type: Number, required: true },
                    stock: { type: Number, default: 0 },
                },
            ],
            images: { type: [String], default: [] },
        }, { timestamps: true });
        this.model = mongoose_1.default.model("products", productSchema);
    }
    getModel() {
        return this.model;
    }
}
exports.default = new ProductModel();
