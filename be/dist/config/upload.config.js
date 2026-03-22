"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productImageUpload = exports.productUploadDir = exports.uploadRootDir = void 0;
exports.ensureUploadDirectories = ensureUploadDirectories;
exports.toProductImageUrl = toProductImageUrl;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const multer_1 = __importDefault(require("multer"));
exports.uploadRootDir = path_1.default.resolve(process.cwd(), "storage");
exports.productUploadDir = path_1.default.join(exports.uploadRootDir, "products");
function ensureUploadDirectories() {
    fs_1.default.mkdirSync(exports.productUploadDir, { recursive: true });
}
ensureUploadDirectories();
const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, exports.productUploadDir);
    },
    filename: (_req, file, cb) => {
        const extension = path_1.default.extname(file.originalname || "").toLowerCase() || ".jpg";
        const safeBaseName = path_1.default
            .basename(file.originalname || "product-image", extension)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 48);
        const fileName = `${safeBaseName || "product-image"}-${Date.now()}-${crypto_1.default.randomUUID().slice(0, 8)}${extension}`;
        cb(null, fileName);
    },
});
exports.productImageUpload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 8 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            cb(new Error("Only JPG, PNG, WEBP, and GIF images are allowed."));
            return;
        }
        cb(null, true);
    },
});
function toProductImageUrl(fileName) {
    return `/uploads/products/${fileName}`;
}
