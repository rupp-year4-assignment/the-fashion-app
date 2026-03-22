"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpException_1 = __importDefault(require("../utils/httpException"));
class BadRequestException extends httpException_1.default {
    constructor(message = "Bad Request", errors) {
        super(400, message, errors);
        this.name = "BadRequestException";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.default = BadRequestException;
