import AddressController from "@controllers/address.controller";
import validationMiddleware, {
  ValidationMiddleware,
} from "@middlewares/validation.middleware";
import AddressServiceImpl from "@services/impl/address.service.impl";
import asyncHandler from "@utils/asyncHandler";
import { Router } from "express";

const addressRouter = Router();
const addressController = new AddressController(new AddressServiceImpl());

addressRouter.get("/addresses", asyncHandler(addressController.getAddresses));
addressRouter.post(
  "/addresses",
  validationMiddleware.addAddress,
  ValidationMiddleware,
  asyncHandler(addressController.addAddress)
);
addressRouter.patch(
  "/addresses/:addressId",
  validationMiddleware.updateAddress,
  ValidationMiddleware,
  asyncHandler(addressController.updateAddress)
);
addressRouter.delete(
  "/addresses/:addressId",
  validationMiddleware.removeAddress,
  ValidationMiddleware,
  asyncHandler(addressController.removeAddress)
);
addressRouter.patch(
  "/addresses/:addressId/default",
  validationMiddleware.setDefaultAddress,
  ValidationMiddleware,
  asyncHandler(addressController.setDefaultAddress)
);

export default addressRouter;
