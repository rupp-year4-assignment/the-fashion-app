import ShopAddressController from "@controllers/shop_address.controller";
import validationMiddleware, {
  ValidationMiddleware,
} from "@middlewares/validation.middleware";
import ShopAddressServiceImpl from "@services/impl/shop_address.service.impl";
import asyncHandler from "@utils/asyncHandler";
import { Router } from "express";

const shopAddressRouter = Router();
const shopAddressController = new ShopAddressController(
  new ShopAddressServiceImpl()
);

shopAddressRouter.get(
  "/shop-addresses/default",
  asyncHandler(shopAddressController.getDefaultShopAddress)
);
shopAddressRouter.get(
  "/shop-addresses",
  asyncHandler(shopAddressController.listShopAddresses)
);
shopAddressRouter.put(
  "/shop-addresses/default",
  validationMiddleware.upsertShopAddress,
  ValidationMiddleware,
  asyncHandler(shopAddressController.upsertDefaultShopAddress)
);

export default shopAddressRouter;
