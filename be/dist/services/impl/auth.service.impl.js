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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../../models/user"));
const token_1 = __importDefault(require("../../models/token"));
const conflictContent_exception_1 = __importDefault(require("../../exceptions/conflictContent.exception"));
const unauthorized_exception_1 = __importDefault(require("../../exceptions/unauthorized.exception"));
const badRequest_exception_1 = __importDefault(require("../../exceptions/badRequest.exception"));
const redisUtils_1 = __importDefault(require("../../utils/redisUtils"));
const jwtUtils_1 = require("../../utils/jwtUtils");
class AuthServiceImpl {
    constructor() {
        this.model = user_1.default.getModel();
        this.modelToken = token_1.default.getModel();
    }
    continueWithGoogle(credential) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let user = yield this.model.findOne({ email: credential._json.email });
            if (!user) {
                user = (yield this.model.create({
                    fullName: credential._json.name,
                    email: credential._json.email,
                    gender: (_a = credential.gender) !== null && _a !== void 0 ? _a : "not_specified",
                    role: "user",
                    status: "active",
                    emailVerifiedAt: new Date(),
                    passwordHash: yield bcryptjs_1.default.genSalt(10),
                    oauthProviders: [
                        {
                            provider: "google",
                            providerId: credential.sub,
                            linkedAt: new Date(),
                        },
                    ],
                }));
            }
            else {
                const hasGoogleProvider = user.oauthProviders.find((provider) => {
                    return (provider.provider === "google" &&
                        provider.providerId === credential.sub);
                });
                if (!hasGoogleProvider) {
                    user.oauthProviders.push({
                        provider: "google",
                        providerId: credential.sub,
                        linkedAt: new Date(),
                    });
                    yield user.save();
                }
            }
            if (!user) {
                throw new Error("User creation failed");
            }
            const access = (0, jwtUtils_1.generateAccessToken)(user._id.toString());
            const refresh = (0, jwtUtils_1.generateRefreshToken)(user._id.toString());
            yield this.modelToken.findOneAndUpdate({ userId: user._id }, {
                tokenHash: yield bcryptjs_1.default.hash(crypto.randomUUID(), 10),
                expiredAt: new Date((yield (0, jwtUtils_1.verifyRefreshToken)(refresh)).exp *
                    1000),
            }, { upsert: true, new: true });
            return { access_token: access, refresh_token: refresh };
        });
    }
    continueWithFacebook(credential) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let user = yield this.model.findOne({ email: credential.email });
            if (!user) {
                user = (yield this.model.create({
                    fullName: credential.name,
                    email: credential.email,
                    gender: (_a = credential.gender) !== null && _a !== void 0 ? _a : "not_specified",
                    role: "user",
                    status: "active",
                    emailVerifiedAt: new Date(),
                    passwordHash: yield bcryptjs_1.default.genSalt(10),
                    oauthProviders: [
                        {
                            provider: "facebook",
                            providerId: credential.id,
                            linkedAt: new Date(),
                        },
                    ],
                }));
            }
            else {
                const hasFacebookProvider = user.oauthProviders.find((provider) => {
                    return (provider.provider === "facebook" &&
                        provider.providerId === credential.id);
                });
                if (!hasFacebookProvider) {
                    user.oauthProviders.push({
                        provider: "facebook",
                        providerId: credential.id,
                        linkedAt: new Date(),
                    });
                    yield user.save();
                }
            }
            if (!user) {
                throw new Error("User creation failed");
            }
            const access = (0, jwtUtils_1.generateAccessToken)(user._id.toString());
            const refresh = (0, jwtUtils_1.generateRefreshToken)(user._id.toString());
            yield this.modelToken.findOneAndUpdate({ userId: user._id }, {
                tokenHash: yield bcryptjs_1.default.hash(crypto.randomUUID(), 10),
                expiredAt: new Date((yield (0, jwtUtils_1.verifyRefreshToken)(refresh)).exp *
                    1000),
            }, { upsert: true, new: true });
            return { access_token: access, refresh_token: refresh };
        });
    }
    login(credential) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.model.findOne({
                email: credential.email,
                status: "active",
            });
            if (!user) {
                throw new unauthorized_exception_1.default("Invalid credentials");
            }
            const match = yield bcryptjs_1.default.compare(credential.password, user.passwordHash || "");
            if (!match) {
                throw new unauthorized_exception_1.default("Invalid credentials");
            }
            const access = (0, jwtUtils_1.generateAccessToken)(user._id.toString());
            const refresh = (0, jwtUtils_1.generateRefreshToken)(user._id.toString());
            yield this.modelToken.findOneAndUpdate({ userId: user._id }, {
                tokenHash: yield bcryptjs_1.default.hash(refresh, 10),
                expiredAt: new Date((yield (0, jwtUtils_1.verifyRefreshToken)(refresh)).exp *
                    1000),
            }, { upsert: true, new: true });
            return { access_token: access, refresh_token: refresh };
        });
    }
    register(credential) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const email = credential.email.trim().toLowerCase();
            const existing = yield this.model.findOne({ email });
            if (existing) {
                throw new conflictContent_exception_1.default("email already exist");
            }
            const hasValidVerificationToken = yield redisUtils_1.default.consumeVerificationToken(email, "register", credential.emailVerificationToken);
            if (!hasValidVerificationToken) {
                throw new badRequest_exception_1.default("Email verification is required before registration");
            }
            const created = yield this.model.create({
                fullName: credential.firstName + " " + credential.lastName,
                email,
                gender: (_a = credential.gender) !== null && _a !== void 0 ? _a : "not_specified",
                role: "user",
                status: "active",
                emailVerifiedAt: new Date(),
                passwordHash: yield bcryptjs_1.default.hash(credential.password, 10),
            });
            return created._id.toString();
        });
    }
    logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            yield token_1.default
                .getModel()
                .findOneAndDelete({ tokenHash: refreshToken });
        });
    }
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = (0, jwtUtils_1.verifyRefreshToken)(refreshToken);
            if (!decoded || (decoded === null || decoded === void 0 ? void 0 : decoded.invalid) || (decoded === null || decoded === void 0 ? void 0 : decoded.expired)) {
                throw new unauthorized_exception_1.default("Invalid refresh token");
            }
            const newAccessToken = (0, jwtUtils_1.generateAccessToken)(decoded.id);
            const newRefreshToken = (0, jwtUtils_1.generateRefreshToken)(decoded.id);
            yield this.modelToken.findOneAndUpdate({ userId: decoded.id }, {
                tokenHash: yield bcryptjs_1.default.hash(newRefreshToken, 10),
                expiredAt: new Date((yield (0, jwtUtils_1.verifyRefreshToken)(newRefreshToken))
                    .exp * 1000),
            }, { upsert: true, new: true });
            return { access_token: newAccessToken, refresh_token: newRefreshToken };
        });
    }
}
exports.default = AuthServiceImpl;
