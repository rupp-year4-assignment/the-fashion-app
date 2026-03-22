"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
const httpException_1 = __importDefault(require("../utils/httpException"));
function errorHandler(err, req, res, next) {
    if (err instanceof httpException_1.default) {
        return res.status(err.status).json({
            status: "error",
            statusCode: err.status,
            message: err.message,
            errors: err.errors || null,
        });
    }
    if ((err === null || err === void 0 ? void 0 : err.errors) && Array.isArray(err.errors)) {
        return res.status(400).json({
            status: "error",
            statusCode: 400,
            message: "Validation failed",
            errors: err.errors,
        });
    }
    return res.status(500).json({
        status: "error",
        statusCode: 500,
        message: (err === null || err === void 0 ? void 0 : err.message) || "Internal Server Error",
    });
}
