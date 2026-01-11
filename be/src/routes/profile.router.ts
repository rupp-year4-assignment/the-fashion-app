import profileController from "@controllers/profile.controller";
import { Router } from "express";
import asyncHandler from "@utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(profileController.show));

router.put("/", asyncHandler(profileController.update));

router.delete("/", asyncHandler(profileController.delete));

export default router;
