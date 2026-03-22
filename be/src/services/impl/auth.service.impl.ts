import { IAuthService } from "@services/auth.service";
import { IUser } from "@models/user";
import bcrypt from "bcryptjs";
import { registerRequest } from "@dtos/request/register.request";
import { loginRequest } from "@dtos/request/login.request";
import userModel from "@models/user";
import userToken from "@models/token";
import { Model } from "mongoose";
import ConflictContentException from "@exceptions/conflictContent.exception";
import UnauthorizedException from "@exceptions/unauthorized.exception";
import BadRequestException from "@exceptions/badRequest.exception";
import redisUtils from "@utils/redisUtils";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@utils/jwtUtils";
import { IUserToken } from "@models/token";
import { JwtPayload } from "jsonwebtoken";

class AuthServiceImpl implements IAuthService {
  private model: Model<IUser>;
  private modelToken: Model<IUserToken>;

  constructor() {
    this.model = userModel.getModel();
    this.modelToken = userToken.getModel();
  }
  async continueWithGoogle(credential: any): Promise<any> {
    let user = await this.model.findOne({ email: credential._json.email });
    if (!user) {
      user = (await this.model.create({
        fullName: credential._json.name,
        email: credential._json.email,
        gender: credential.gender ?? "not_specified",
        role: "user",
        status: "active",
        emailVerifiedAt: new Date(),
        passwordHash: await bcrypt.genSalt(10),
        oauthProviders: [
          {
            provider: "google",
            providerId: credential.sub,
            linkedAt: new Date(),
          },
        ],
      } as any)) as any;
    } else {
      const hasGoogleProvider = user.oauthProviders.find((provider) => {
        return (
          provider.provider === "google" &&
          provider.providerId === credential.sub
        );
      });

      if (!hasGoogleProvider) {
        user.oauthProviders.push({
          provider: "google",
          providerId: credential.sub,
          linkedAt: new Date(),
        });
        await user.save();
      }
    }

    if (!user) {
      throw new Error("User creation failed");
    }

    const access = generateAccessToken(user._id.toString());
    const refresh = generateRefreshToken(user._id.toString());

    await this.modelToken.findOneAndUpdate(
      { userId: user._id as any },
      {
        tokenHash: await bcrypt.hash(crypto.randomUUID(), 10),
        expiredAt: new Date(
          (((await verifyRefreshToken(refresh)) as JwtPayload).exp as number) *
            1000
        ),
      } as any,
      { upsert: true, new: true }
    );

    return { access_token: access, refresh_token: refresh };
  }

  async continueWithFacebook(credential: any): Promise<any> {
    let user = await this.model.findOne({ email: credential.email });
    if (!user) {
      user = (await this.model.create({
        fullName: credential.name,
        email: credential.email,
        gender: credential.gender ?? "not_specified",
        role: "user",
        status: "active",
        emailVerifiedAt: new Date(),
        passwordHash: await bcrypt.genSalt(10),
        oauthProviders: [
          {
            provider: "facebook",
            providerId: credential.id,
            linkedAt: new Date(),
          },
        ],
      } as any)) as any;
    } else {
      const hasFacebookProvider = user.oauthProviders.find((provider) => {
        return (
          provider.provider === "facebook" &&
          provider.providerId === credential.id
        );
      });

      if (!hasFacebookProvider) {
        user.oauthProviders.push({
          provider: "facebook",
          providerId: credential.id,
          linkedAt: new Date(),
        });
        await user.save();
      }
    }

    if (!user) {
      throw new Error("User creation failed");
    }

    const access = generateAccessToken(user._id.toString());
    const refresh = generateRefreshToken(user._id.toString());

    await this.modelToken.findOneAndUpdate(
      { userId: user._id as any },
      {
        tokenHash: await bcrypt.hash(crypto.randomUUID(), 10),
        expiredAt: new Date(
          (((await verifyRefreshToken(refresh)) as JwtPayload).exp as number) *
            1000
        ),
      } as any,
      { upsert: true, new: true }
    );

    return { access_token: access, refresh_token: refresh };
  }

  async login(credential: loginRequest): Promise<any> {
    const user = await this.model.findOne({
      email: credential.email,
      status: "active",
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const match = await bcrypt.compare(
      credential.password,
      user.passwordHash || ""
    );
    if (!match) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const access = generateAccessToken(user._id.toString());
    const refresh = generateRefreshToken(user._id.toString());

    await this.modelToken.findOneAndUpdate(
      { userId: user._id as any },
      {
        tokenHash: await bcrypt.hash(refresh, 10),
        expiredAt: new Date(
          (((await verifyRefreshToken(refresh)) as JwtPayload).exp as number) *
            1000
        ),
      } as any,
      { upsert: true, new: true }
    );

    return { access_token: access, refresh_token: refresh };
  }

  async register(credential: registerRequest): Promise<any | string> {
    const email = credential.email.trim().toLowerCase();

    const existing = await this.model.findOne({ email });
    if (existing) {
      throw new ConflictContentException("email already exist");
    }

    const hasValidVerificationToken =
      await redisUtils.consumeVerificationToken(
        email,
        "register",
        credential.emailVerificationToken
      );

    if (!hasValidVerificationToken) {
      throw new BadRequestException(
        "Email verification is required before registration"
      );
    }

    const created = await this.model.create({
      fullName: credential.firstName + " " + credential.lastName,
      email,
      gender: credential.gender ?? "not_specified",
      role: "user",
      status: "active",
      emailVerifiedAt: new Date(),
      passwordHash: await bcrypt.hash(credential.password, 10),
    });

    return created._id.toString();
  }

  async logout(refreshToken: string): Promise<void> {
    await userToken
      .getModel()
      .findOneAndDelete({ tokenHash: refreshToken as string });
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded || decoded?.invalid || decoded?.expired) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const newAccessToken = generateAccessToken(decoded.id);
    const newRefreshToken = generateRefreshToken(decoded.id);

    await this.modelToken.findOneAndUpdate(
      { userId: decoded.id as any },
      {
        tokenHash: await bcrypt.hash(newRefreshToken, 10),
        expiredAt: new Date(
          (((await verifyRefreshToken(newRefreshToken)) as JwtPayload)
            .exp as number) * 1000
        ),
      } as any,
      { upsert: true, new: true }
    );

    return { access_token: newAccessToken, refresh_token: newRefreshToken };
  }
}

export default AuthServiceImpl;
