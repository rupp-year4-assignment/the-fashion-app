"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_ACCESS_SECRET || "access_secret", {
        expiresIn: "15m",
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
        expiresIn: "7d",
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET || "access_secret");
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return { expired: true };
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return { invalid: true };
        }
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET || "refresh_secret");
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return { expired: true };
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return { invalid: true };
        }
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const verifyToken = (token) => {
    return (0, exports.verifyAccessToken)(token);
};
exports.verifyToken = verifyToken;
