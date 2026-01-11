import { IUser } from "@models/user";
import { ObjectId } from "mongoose";

export interface ProfileService {
  update(id: ObjectId, user: IUser): Promise<IUser | any>;
  delete(id: ObjectId): Promise<void>;
}
