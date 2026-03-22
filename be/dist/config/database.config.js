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
const mongoose_1 = __importDefault(require("mongoose"));
class DBConfig {
    connectDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongoURI = process.env.MONGO_URI ||
                    "mongodb://superuser:superuser@localhost:27017/theFashionAppDB?authSource=admin";
                const options = {
                    authSource: process.env.MONGO_AUTH_DB || "admin",
                    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
                    connectTimeoutMS: 5000,
                    socketTimeoutMS: 10000,
                };
                yield mongoose_1.default.connect(mongoURI, options);
                console.info("Database connected successfully.");
            }
            catch (err) {
                console.error("Failed to connect to MongoDB:", err);
                throw err;
            }
        });
    }
}
exports.default = new DBConfig();
