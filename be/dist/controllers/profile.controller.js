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
const profile_service_impl_1 = __importDefault(require("../services/impl/profile.service.impl"));
class ProfileController {
    constructor(profileService) {
        this.profileService = profileService;
        this.show = this.show.bind(this);
        this.update = this.update.bind(this);
    }
    show(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const data = yield this.profileService.show(user._id);
            res.status(200).json({
                success: true,
                message: "User profile retrieved successfully.",
                data,
            });
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const data = yield this.profileService.update(user._id, req.body);
            res.status(200).json({
                success: true,
                message: "Profile updated successfully.",
                data,
            });
        });
    }
}
exports.default = new ProfileController(new profile_service_impl_1.default());
