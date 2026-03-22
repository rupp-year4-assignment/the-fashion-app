import ProfileServiceImpl from "@services/impl/profile.service.impl";
import { ProfileService } from "@services/profile.service";
import { Request, Response } from "express";
import { IUser } from "@models/user";

class ProfileController {
  private profileService: ProfileService;

  constructor(profileService: ProfileService) {
    this.profileService = profileService;
    this.show = this.show.bind(this);
    this.update = this.update.bind(this);
  }

  async show(req: Request, res: Response) {
    const user = req.user as IUser;
    const data = await this.profileService.show(user._id as any);

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully.",
      data,
    });
  }

  async update(req: Request, res: Response) {
    const user = req.user as IUser;
    const data = await this.profileService.update(user._id as any, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data,
    });
  }
}

export default new ProfileController(new ProfileServiceImpl());
