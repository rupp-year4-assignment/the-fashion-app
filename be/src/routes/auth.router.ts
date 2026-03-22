import authController from "@controllers/auth.controller";
import express from "express";
import validationMiddleware, {
  ValidationMiddleware,
} from "@middlewares/validation.middleware";
import ExceptionHandler from "@utils/asyncHandler";
import passport from "passport";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validationMiddleware.register,
  ValidationMiddleware,
  ExceptionHandler(authController.register)
);

authRouter.post(
  "/login",
  validationMiddleware.login,
  ValidationMiddleware,
  ExceptionHandler(authController.login)
);

authRouter.post("/refresh", ExceptionHandler(authController.refreshToken));

authRouter.post("/logout", ExceptionHandler(authController.logout));

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  ExceptionHandler(authController.continueWithGoogle)
);

authRouter.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

authRouter.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  ExceptionHandler(authController.continueWithFacebook)
);

export default authRouter;
