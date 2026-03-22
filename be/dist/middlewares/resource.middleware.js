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
const jwtUtils_1 = require("../utils/jwtUtils");
const forbidden_exception_1 = __importDefault(require("../exceptions/forbidden.exception"));
const user_1 = __importDefault(require("../models/user"));
const token_1 = __importDefault(require("../models/token"));
const permitRoutes_1 = require("../utils/permitRoutes");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const routeValidation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        // Debug log for serverless
        console.log("Request path:", req.path, "Method:", req.method);
        if ((0, permitRoutes_1.permitRoutes)(req, "POST", "/api/v1/auth/*") ||
            (0, permitRoutes_1.permitRoutes)(req, "GET", "/") ||
            (0, permitRoutes_1.permitRoutes)(req, "GET", "/api-doc") ||
            (0, permitRoutes_1.permitRoutes)(req, "GET", "/api-doc/*") ||
            (0, permitRoutes_1.permitRoutes)(req, "GET", "/api-docs") ||
            (0, permitRoutes_1.permitRoutes)(req, "GET", "/api-docs/*") ||
            (0, permitRoutes_1.permitRoutes)(req, "GET", "/api-doc.json") ||
            (0, permitRoutes_1.permitRoutes)(req, "GET", "/api-docs.json") ||
            (0, permitRoutes_1.permitRoutes)(req, "POST", "/api/v1/send-verification-code") ||
            (0, permitRoutes_1.permitRoutes)(req, "POST", "/api/v1/verify-code") ||
            (0, permitRoutes_1.permitRoutes)(req, "GET", "/api/v1/products") ||
            (0, permitRoutes_1.permitRoutes)(req, "GET", "/api/v1/products/*") ||
            (0, permitRoutes_1.permitRoutes)(req, "GET", "/api/v1/cart") ||
            (0, permitRoutes_1.permitRoutes)(req, "GET", "/api/v1/cart/*") ||
            (0, permitRoutes_1.permitRoutes)(req, "POST", "/api/v1/order") ||
            (0, permitRoutes_1.permitRoutes)(req, "POST", "/api/v1/order/*") ||
            (0, permitRoutes_1.permitRoutes)(req, "POST", "/api/v1/payment") ||
            (0, permitRoutes_1.permitRoutes)(req, "POST", "/api/v1/payment/*")) {
            return next();
        }
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new forbidden_exception_1.default();
        }
        const token = authHeader.substring(7);
        let decoded = (0, jwtUtils_1.verifyAccessToken)(token);
        if (!decoded || (decoded === null || decoded === void 0 ? void 0 : decoded.invalid)) {
            throw new forbidden_exception_1.default();
        }
        if (decoded === null || decoded === void 0 ? void 0 : decoded.expired) {
            const refresh_token = req.headers["x-refresh-token"];
            if (!refresh_token) {
                throw new forbidden_exception_1.default();
            }
            decoded = (0, jwtUtils_1.verifyRefreshToken)(refresh_token);
            if (!decoded || (decoded === null || decoded === void 0 ? void 0 : decoded.invalid) || (decoded === null || decoded === void 0 ? void 0 : decoded.expired)) {
                throw new forbidden_exception_1.default();
            }
            if (decoded && !decoded.expired && !decoded.invalid) {
                const storedToken = yield token_1.default.getModel().findOne({
                    userId: decoded.id,
                });
                if (!storedToken) {
                    throw new forbidden_exception_1.default();
                }
                if (!(yield bcryptjs_1.default.compare(refresh_token, storedToken.tokenHash))) {
                    throw new forbidden_exception_1.default();
                }
            }
            const newAccessToken = (0, jwtUtils_1.generateAccessToken)(decoded.id);
            res.setHeader("x-access-token", newAccessToken);
        }
        const user = yield user_1.default.getModel().findById(decoded.id).lean();
        if (!user)
            throw new forbidden_exception_1.default();
        req.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.default = routeValidation;
