import userModel, { IUser } from "@models/user";
import { ProfileService } from "@services/profile.service";
import { Model } from "mongoose";

class ProfileServiceImpl implements ProfileService {
  private model: Model<IUser>;

  constructor() {
    this.model = userModel.getModel();
  }

  async update(id: any, user: IUser): Promise<IUser | any> {
    return await this.model.findByIdAndUpdate(
      {
        _id: id,
      },
      user
    );
  }

  async delete(id: any): Promise<void> {
    await this.model.findOneAndUpdate({ _id: id }, { deleted: true });
  }
}

export default ProfileServiceImpl;
