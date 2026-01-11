import { IUser } from "@models/user";
import ProfileServiceImpl from "@services/impl/profile.service.impl";
import { ProfileService } from "@services/profile.service";
import { Request, Response } from "express";

class ProfileController {
  private profileService: ProfileService;

  constructor(profileService: ProfileService) {
    this.profileService = profileService;
    this.delete = this.delete.bind(this);
    this.show = this.show.bind(this);
    this.update = this.update.bind(this);
  }

  async show(req: Request, res: Response) {
    const user = req.user;
    res.status(200).send({
      message: "User profile retrieved successfully.",
      isSuccess: true,
      statusCode: 200,
      data: {
        user: user,
      },
    });
  }

  async update(req: Request, res: Response) {
    const user = req.user as IUser;
    const updateData = req.body;

    this.profileService.update(user?._id as any, updateData);

    res.status(200).send({
      message: "User profile updated successfully.",
      isSuccess: true,
      statusCode: 200,
    });
  }
  async delete(req: Request, res: Response) {
    const user = req.user as IUser;

    await this.profileService.delete(user?._id as any);

    res.status(200).send({
      message: "User profile deleted successfully.",
      isSuccess: true,
      statusCode: 200,
    });
  }
}

export default new ProfileController(new ProfileServiceImpl());
