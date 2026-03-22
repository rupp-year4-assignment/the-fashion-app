import express from "express";
import otpController from "@controllers/otp.controller";
import validationMiddleware, {
  ValidationMiddleware,
} from "@middlewares/validation.middleware";

import asyncHandler from "@utils/asyncHandler";

const otpRouter = express.Router();

otpRouter.post(
  "/send-verification-code",
  validationMiddleware.OTP_ctr_sendMailVerificationCode,
  ValidationMiddleware,
  asyncHandler(otpController.sendVerificationCode)
);

otpRouter.post(
  "/verify-code",
  validationMiddleware.OTP_ctr_verifyCode,
  ValidationMiddleware,
  asyncHandler(otpController.verifyCode)
);

export default otpRouter;
