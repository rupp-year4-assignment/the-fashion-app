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
const badRequest_exception_1 = __importDefault(require("../exceptions/badRequest.exception"));
const upload_config_1 = require("../config/upload.config");
class UploadController {
    constructor() {
        this.uploadProductImage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const file = req.file;
            if (!file) {
                throw new badRequest_exception_1.default("Image file is required.");
            }
            res.status(201).json({
                success: true,
                message: "Product image uploaded successfully.",
                data: {
                    fileName: file.filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url: (0, upload_config_1.toProductImageUrl)(file.filename),
                },
            });
        });
    }
}
exports.default = new UploadController();
