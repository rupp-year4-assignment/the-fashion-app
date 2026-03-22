import { Request, Response, NextFunction } from "express";
import HttpException from "@utils/httpException";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof HttpException) {
    return res.status(err.status).json({
      status: "error",
      statusCode: err.status,
      message: err.message,
      errors: err.errors || null,
    });
  }

  if (err?.errors && Array.isArray(err.errors)) {
    return res.status(400).json({
      status: "error",
      statusCode: 400,
      message: "Validation failed",
      errors: err.errors,
    });
  }

  return res.status(500).json({
    status: "error",
    statusCode: 500,
    message: err?.message || "Internal Server Error",
  });
}
