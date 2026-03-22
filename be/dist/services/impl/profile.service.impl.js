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
const badRequest_exception_1 = __importDefault(require("../../exceptions/badRequest.exception"));
const notFound_exception_1 = __importDefault(require("../../exceptions/notFound.exception"));
const user_1 = __importDefault(require("../../models/user"));
const mongoose_1 = require("mongoose");
class ProfileServiceImpl {
    constructor() {
        this.model = user_1.default.getModel();
    }
    splitName(fullName) {
        var _a, _b;
        const normalized = (fullName !== null && fullName !== void 0 ? fullName : "").trim();
        if (!normalized) {
            return { firstName: "", lastName: "" };
        }
        const parts = normalized.split(/\s+/).filter(Boolean);
        if (parts.length <= 1) {
            return { firstName: (_a = parts[0]) !== null && _a !== void 0 ? _a : "", lastName: "" };
        }
        return {
            firstName: (_b = parts[0]) !== null && _b !== void 0 ? _b : "",
            lastName: parts.slice(1).join(" "),
        };
    }
    toResponse(user) {
        var _a, _b, _c, _d, _e;
        const names = this.splitName(user.fullName);
        return {
            id: user._id.toString(),
            firstName: names.firstName,
            lastName: names.lastName,
            fullName: user.fullName,
            email: user.email,
            gender: (_a = user.gender) !== null && _a !== void 0 ? _a : "not_specified",
            phoneNumber: ((_b = user.phoneNumber) !== null && _b !== void 0 ? _b : "").trim(),
            dateOfBirth: (_c = user.dateOfBirth) !== null && _c !== void 0 ? _c : null,
            role: user.role,
            status: user.status,
            createdAt: (_d = user.createdAt) !== null && _d !== void 0 ? _d : null,
            updatedAt: (_e = user.updatedAt) !== null && _e !== void 0 ? _e : null,
        };
    }
    getUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.model.findById(new mongoose_1.Types.ObjectId(userId.toString()));
            if (!user) {
                throw new notFound_exception_1.default("User not found.");
            }
            return user;
        });
    }
    show(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUser(userId);
            return this.toResponse(user);
        });
    }
    update(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const user = yield this.getUser(userId);
            const currentNames = this.splitName(user.fullName);
            if (payload.firstName != null || payload.lastName != null) {
                const firstName = ((_a = payload.firstName) !== null && _a !== void 0 ? _a : currentNames.firstName).trim();
                const lastName = ((_b = payload.lastName) !== null && _b !== void 0 ? _b : currentNames.lastName).trim();
                if (!firstName) {
                    throw new badRequest_exception_1.default("First name is required.");
                }
                user.fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
            }
            if (payload.gender != null) {
                user.gender = payload.gender;
            }
            if (payload.phoneNumber !== undefined) {
                const normalizedPhone = ((_c = payload.phoneNumber) !== null && _c !== void 0 ? _c : "").trim();
                user.phoneNumber = normalizedPhone || null;
            }
            if (payload.dateOfBirth !== undefined) {
                if (payload.dateOfBirth === null || payload.dateOfBirth.trim() === "") {
                    user.dateOfBirth = null;
                }
                else {
                    const parsed = new Date(payload.dateOfBirth);
                    if (Number.isNaN(parsed.getTime())) {
                        throw new badRequest_exception_1.default("Invalid dateOfBirth.");
                    }
                    user.dateOfBirth = parsed;
                }
            }
            yield user.save();
            return this.toResponse(user);
        });
    }
}
exports.default = ProfileServiceImpl;
