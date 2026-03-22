"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRoles = hasRoles;
const forbidden_exception_1 = __importDefault(require("../exceptions/forbidden.exception"));
function hasRoles(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user)
            return next(new forbidden_exception_1.default());
        if (roles.length === 0)
            return next();
        if (!roles.includes(user.role)) {
            return next(new forbidden_exception_1.default());
        }
        next();
    };
}
