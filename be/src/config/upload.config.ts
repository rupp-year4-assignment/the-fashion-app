import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

export const uploadRootDir = path.resolve(process.cwd(), "storage");
export const productUploadDir = path.join(uploadRootDir, "products");

export function ensureUploadDirectories() {
  fs.mkdirSync(productUploadDir, { recursive: true });
}

ensureUploadDirectories();

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, productUploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeBaseName = path
      .basename(file.originalname || "product-image", extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);

    const fileName = `${safeBaseName || "product-image"}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}${extension}`;
    cb(null, fileName);
  },
});

export const productImageUpload = multer({
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

export function toProductImageUrl(fileName: string) {
  return `/uploads/products/${fileName}`;
}
