import {
  ProfileResponseDTO,
  UpdateProfileDTO,
} from "@dtos/request/profile.request";
import { ObjectId } from "mongoose";

export interface ProfileService {
  show(userId: ObjectId): Promise<ProfileResponseDTO>;
  update(userId: ObjectId, payload: UpdateProfileDTO): Promise<ProfileResponseDTO>;
}
