"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpException_1 = __importDefault(require("../utils/httpException"));
class ForbiddenException extends httpException_1.default {
    constructor(message = "Forbidden") {
        super(403, message);
        this.name = "ForbiddenException";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.default = ForbiddenException;
