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
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = __importStar(require("../middlewares/validation.middleware"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const passport_1 = __importDefault(require("passport"));
const authRouter = express_1.default.Router();
authRouter.post("/register", validation_middleware_1.default.register, validation_middleware_1.ValidationMiddleware, (0, asyncHandler_1.default)(auth_controller_1.default.register));
authRouter.post("/login", validation_middleware_1.default.login, validation_middleware_1.ValidationMiddleware, (0, asyncHandler_1.default)(auth_controller_1.default.login));
authRouter.post("/refresh", (0, asyncHandler_1.default)(auth_controller_1.default.refreshToken));
authRouter.post("/logout", (0, asyncHandler_1.default)(auth_controller_1.default.logout));
authRouter.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get("/google/callback", passport_1.default.authenticate("google", { session: false }), (0, asyncHandler_1.default)(auth_controller_1.default.continueWithGoogle));
authRouter.get("/facebook", passport_1.default.authenticate("facebook", { scope: ["email"] }));
authRouter.get("/facebook/callback", passport_1.default.authenticate("facebook", { session: false }), (0, asyncHandler_1.default)(auth_controller_1.default.continueWithFacebook));
exports.default = authRouter;
