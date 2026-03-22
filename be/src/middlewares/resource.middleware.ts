import { Request, Response, NextFunction, RequestHandler } from "express";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@utils/jwtUtils";
import ForbiddenException from "@exceptions/forbidden.exception";
import userModel from "@models/user";
import userToken from "@models/token";
import { permitRoutes } from "@utils/permitRoutes";
import bcrypt from "bcryptjs";

const routeValidation: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // Debug log for serverless
    console.log("Request path:", req.path, "Method:", req.method);

    if (
      permitRoutes(req, "POST", "/api/v1/auth/*") ||
      permitRoutes(req, "GET", "/") ||
      permitRoutes(req, "GET", "/api-doc") ||
      permitRoutes(req, "GET", "/api-doc/*") ||
      permitRoutes(req, "GET", "/api-docs") ||
      permitRoutes(req, "GET", "/api-docs/*") ||
      permitRoutes(req, "GET", "/api-doc.json") ||
      permitRoutes(req, "GET", "/api-docs.json") ||
      permitRoutes(req, "POST", "/api/v1/send-verification-code") ||
      permitRoutes(req, "POST", "/api/v1/verify-code") ||
      permitRoutes(req, "GET", "/api/v1/products") ||
      permitRoutes(req, "GET", "/api/v1/products/*") ||
      permitRoutes(req, "GET", "/api/v1/cart") ||
      permitRoutes(req, "GET", "/api/v1/cart/*") ||
      permitRoutes(req, "POST", "/api/v1/order") ||
      permitRoutes(req, "POST", "/api/v1/order/*") ||
      permitRoutes(req, "POST", "/api/v1/payment") ||
      permitRoutes(req, "POST", "/api/v1/payment/*")
    ) {
      return next();
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ForbiddenException();
    }

    const token: string = authHeader.substring(7);

    let decoded = verifyAccessToken(token);

    if (!decoded || decoded?.invalid) {
      throw new ForbiddenException();
    }

    if (decoded?.expired) {
      const refresh_token = req.headers["x-refresh-token"];

      if (!refresh_token) {
        throw new ForbiddenException();
      }

      decoded = verifyRefreshToken(refresh_token as string);

      if (!decoded || decoded?.invalid || decoded?.expired) {
        throw new ForbiddenException();
      }

      if (decoded && !decoded.expired && !decoded.invalid) {
        const storedToken = await userToken.getModel().findOne({
          userId: decoded.id,
        });

        if (!storedToken) {
          throw new ForbiddenException();
        }

        if (
          !(await bcrypt.compare(
            refresh_token as string,
            storedToken.tokenHash as string,
          ))
        ) {
          throw new ForbiddenException();
        }
      }

      const newAccessToken = generateAccessToken(decoded.id);
      res.setHeader("x-access-token", newAccessToken);
    }

    const user = await userModel.getModel().findById(decoded.id).lean();
    if (!user) throw new ForbiddenException();

    (req as any).user = user;

    next();
  } catch (err) {
    next(err);
  }
};

export default routeValidation;
