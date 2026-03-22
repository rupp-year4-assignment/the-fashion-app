"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpException extends Error {
    constructor(status = 500, message = "Something went wrong", errors) {
        super(message);
        this.status = status;
        this.message = message;
        this.errors = errors;
        Object.setPrototypeOf(this, HttpException.prototype);
    }
}
exports.default = HttpException;
