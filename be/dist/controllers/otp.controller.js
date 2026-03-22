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
const redisUtils_1 = __importDefault(require("../utils/redisUtils"));
const randOtpCode_1 = require("../utils/randOtpCode");
const mail_service_impl_1 = __importDefault(require("../services/impl/mail.service.impl"));
const user_1 = __importDefault(require("../models/user"));
const conflictContent_exception_1 = __importDefault(require("../exceptions/conflictContent.exception"));
class OTPController {
    constructor(mailer) {
        this.mailer = mailer;
        this.sendVerificationCode = this.sendVerificationCode.bind(this);
        this.verifyCode = this.verifyCode.bind(this);
    }
    sendVerificationCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const email = String(req.body.email).trim().toLowerCase();
            const purpose = ((_a = req.body.purpose) !== null && _a !== void 0 ? _a : "password_reset");
            if (purpose === "register") {
                const existingUser = yield user_1.default.getModel().findOne({ email }).lean();
                if (existingUser) {
                    throw new conflictContent_exception_1.default("Email already exists");
                }
            }
            const otp = yield (0, randOtpCode_1.generateOtp)();
            yield redisUtils_1.default.saveCodeVerification(email, purpose, otp);
            yield this.mailer.sendMailVerificationCode(email, otp);
            res.status(200).send({
                message: "Verification code sent successfully",
                isSuccess: true,
                statusCode: 200,
            });
        });
    }
    verifyCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const email = String(req.body.email).trim().toLowerCase();
            const code = String(req.body.code).trim();
            const purpose = ((_a = req.body.purpose) !== null && _a !== void 0 ? _a : "password_reset");
            const isValid = yield redisUtils_1.default.consumeCodeVerification(email, purpose, code);
            if (!isValid) {
                return res.status(400).send({
                    message: "Invalid or expired verification code",
                    isSuccess: false,
                    isValid: false,
                    statusCode: 400,
                });
            }
            const verificationToken = yield redisUtils_1.default.issueVerificationToken(email, purpose);
            res.status(200).send({
                message: "Verification code is valid",
                isSuccess: true,
                isValid: true,
                statusCode: 200,
                data: {
                    verificationToken,
                },
            });
        });
    }
}
exports.default = new OTPController(mail_service_impl_1.default);
