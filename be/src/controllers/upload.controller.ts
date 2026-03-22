import { Request, Response } from "express";
import BadRequestException from "@exceptions/badRequest.exception";
import { toProductImageUrl } from "../config/upload.config";

class UploadController {
  uploadProductImage = async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
      throw new BadRequestException("Image file is required.");
    }

    res.status(201).json({
      success: true,
      message: "Product image uploaded successfully.",
      data: {
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: toProductImageUrl(file.filename),
      },
    });
  };
}

export default new UploadController();
