"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpException_1 = __importDefault(require("../utils/httpException"));
class NotFoundException extends httpException_1.default {
    constructor(message = "Resource not found") {
        super(404, message);
        this.name = "NotFoundException";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.default = NotFoundException;
