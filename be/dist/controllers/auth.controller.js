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
const auth_service_impl_1 = __importDefault(require("../services/impl/auth.service.impl"));
class AuthController {
    constructor(Service) {
        this.authService = Service;
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
        this.logout = this.logout.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.continueWithGoogle = this.continueWithGoogle.bind(this);
        this.continueWithFacebook = this.continueWithFacebook.bind(this);
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const credential = req.body;
            const userId = yield this.authService.register(credential);
            res.status(201).send({
                message: "User registered successfully.",
                isSuccess: true,
                statusCode: 201,
                data: {
                    userId: userId,
                },
            });
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const credential = req.body;
            const { access_token, refresh_token } = yield this.authService.login(credential);
            res.status(200).send({
                message: "Login successful",
                isSuccess: true,
                statusCode: 200,
                data: {
                    access_token: access_token,
                    refresh_token: refresh_token,
                },
            });
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.authService.logout(req.headers["x-refresh-token"]);
            res.status(200).send({
                message: "Logout successful.",
                isSuccess: true,
                statusCode: 200,
            });
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { refresh_token, access_token } = yield this.authService.refreshToken(req.headers["x-refresh-token"]);
            res.status(200).send({
                message: "Token refreshed successfully",
                isSuccess: true,
                statusCode: 200,
                data: {
                    access_token: access_token,
                    refresh_token: refresh_token,
                },
            });
        });
    }
    continueWithGoogle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const { access_token, refresh_token } = yield this.authService.continueWithGoogle(user);
            res.status(200).send({
                message: "Google OAuth successful",
                isSuccess: true,
                statusCode: 200,
                data: {
                    access_token: access_token,
                    refresh_token: refresh_token,
                },
            });
        });
    }
    continueWithFacebook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const { access_token, refresh_token } = yield this.authService.continueWithFacebook(user);
            res.status(200).send({
                message: "Facebook successful",
                isSuccess: true,
                statusCode: 200,
                data: {
                    access_token: access_token,
                    refresh_token: refresh_token,
                },
            });
        });
    }
}
exports.default = new AuthController(new auth_service_impl_1.default());
