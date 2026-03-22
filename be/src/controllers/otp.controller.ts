import { IMailService } from "@services/mail.service";
import redisUtils from "@utils/redisUtils";
import { generateOtp } from "@utils/randOtpCode";
import { Request, Response } from "express";
import mailServiceImpl from "@services/impl/mail.service.impl";
import userModel from "@models/user";
import ConflictContentException from "@exceptions/conflictContent.exception";

class OTPController {
  private mailer: IMailService;

  constructor(mailer: IMailService) {
    this.mailer = mailer;
    this.sendVerificationCode = this.sendVerificationCode.bind(this);
    this.verifyCode = this.verifyCode.bind(this);
  }

  async sendVerificationCode(req: Request, res: Response) {
    const email = String(req.body.email).trim().toLowerCase();
    const purpose = (req.body.purpose ?? "password_reset") as
      | "register"
      | "password_reset";

    if (purpose === "register") {
      const existingUser = await userModel.getModel().findOne({ email }).lean();
      if (existingUser) {
        throw new ConflictContentException("Email already exists");
      }
    }

    const otp = await generateOtp();

    await redisUtils.saveCodeVerification(email, purpose, otp);
    await this.mailer.sendMailVerificationCode(email, otp);

    res.status(200).send({
      message: "Verification code sent successfully",
      isSuccess: true,
      statusCode: 200,
    });
  }

  async verifyCode(req: Request, res: Response) {
    const email = String(req.body.email).trim().toLowerCase();
    const code = String(req.body.code).trim();
    const purpose = (req.body.purpose ?? "password_reset") as
      | "register"
      | "password_reset";
    const isValid = await redisUtils.consumeCodeVerification(
      email,
      purpose,
      code
    );

    if (!isValid) {
      return res.status(400).send({
        message: "Invalid or expired verification code",
        isSuccess: false,
        isValid: false,
        statusCode: 400,
      });
    }

    const verificationToken = await redisUtils.issueVerificationToken(
      email,
      purpose
    );

    res.status(200).send({
      message: "Verification code is valid",
      isSuccess: true,
      isValid: true,
      statusCode: 200,
      data: {
        verificationToken,
      },
    });
  }
}

export default new OTPController(mailServiceImpl);
