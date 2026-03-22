import {
  ProfileResponseDTO,
  UpdateProfileDTO,
} from "@dtos/request/profile.request";
import BadRequestException from "@exceptions/badRequest.exception";
import NotFoundException from "@exceptions/notFound.exception";
import userModel, { IUser } from "@models/user";
import { ProfileService } from "@services/profile.service";
import { Model, ObjectId, Types } from "mongoose";

class ProfileServiceImpl implements ProfileService {
  private model: Model<IUser>;

  constructor() {
    this.model = userModel.getModel();
  }

  private splitName(fullName: string | null | undefined): {
    firstName: string;
    lastName: string;
  } {
    const normalized = (fullName ?? "").trim();
    if (!normalized) {
      return { firstName: "", lastName: "" };
    }

    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) {
      return { firstName: parts[0] ?? "", lastName: "" };
    }

    return {
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" "),
    };
  }

  private toResponse(user: IUser): ProfileResponseDTO {
    const names = this.splitName(user.fullName);

    return {
      id: user._id.toString(),
      firstName: names.firstName,
      lastName: names.lastName,
      fullName: user.fullName,
      email: user.email,
      gender: user.gender ?? "not_specified",
      phoneNumber: (user.phoneNumber ?? "").trim(),
      dateOfBirth: user.dateOfBirth ?? null,
      role: user.role,
      status: user.status,
      createdAt: (user as any).createdAt ?? null,
      updatedAt: (user as any).updatedAt ?? null,
    };
  }

  private async getUser(userId: ObjectId): Promise<IUser> {
    const user = await this.model.findById(new Types.ObjectId(userId.toString()));
    if (!user) {
      throw new NotFoundException("User not found.");
    }
    return user;
  }

  async show(userId: ObjectId): Promise<ProfileResponseDTO> {
    const user = await this.getUser(userId);
    return this.toResponse(user);
  }

  async update(
    userId: ObjectId,
    payload: UpdateProfileDTO
  ): Promise<ProfileResponseDTO> {
    const user = await this.getUser(userId);
    const currentNames = this.splitName(user.fullName);

    if (payload.firstName != null || payload.lastName != null) {
      const firstName = (payload.firstName ?? currentNames.firstName).trim();
      const lastName = (payload.lastName ?? currentNames.lastName).trim();

      if (!firstName) {
        throw new BadRequestException("First name is required.");
      }

      user.fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    }

    if (payload.gender != null) {
      user.gender = payload.gender;
    }

    if (payload.phoneNumber !== undefined) {
      const normalizedPhone = (payload.phoneNumber ?? "").trim();
      user.phoneNumber = normalizedPhone || null;
    }

    if (payload.dateOfBirth !== undefined) {
      if (payload.dateOfBirth === null || payload.dateOfBirth.trim() === "") {
        user.dateOfBirth = null;
      } else {
        const parsed = new Date(payload.dateOfBirth);
        if (Number.isNaN(parsed.getTime())) {
          throw new BadRequestException("Invalid dateOfBirth.");
        }
        user.dateOfBirth = parsed;
      }
    }

    await user.save();
    return this.toResponse(user);
  }
}

export default ProfileServiceImpl;
