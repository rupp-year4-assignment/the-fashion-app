import profileController from "@controllers/profile.controller";
import validationMiddleware, {
  ValidationMiddleware,
} from "@middlewares/validation.middleware";
import asyncHandler from "@utils/asyncHandler";
import { Router } from "express";

const profileRouter = Router();

profileRouter.get("/profile", asyncHandler(profileController.show));
profileRouter.patch(
  "/profile",
  validationMiddleware.updateProfile,
  ValidationMiddleware,
  asyncHandler(profileController.update)
);

export default profileRouter;
