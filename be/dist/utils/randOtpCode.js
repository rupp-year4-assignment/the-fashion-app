"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = void 0;
const generateOtp = (length = 6) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Promise.resolve(Math.floor(min + Math.random() * (max - min + 1)).toString());
};
exports.generateOtp = generateOtp;
