import { RequestHandler } from "express";
import ForbiddenException from "@exceptions/forbidden.exception";

export function hasRoles(...roles: string[]): RequestHandler {
  return (req, res, next) => {
    const user = (req as any).user;
    if (!user) return next(new ForbiddenException());

    if (roles.length === 0) return next();

    if (!roles.includes(user.role)) {
      return next(new ForbiddenException());
    }

    next();
  };
}
