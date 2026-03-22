import { ShopAddressService } from "@services/shop_address.service";
import { Request, Response } from "express";

class ShopAddressController {
  constructor(private readonly shopAddressService: ShopAddressService) {
    this.getDefaultShopAddress = this.getDefaultShopAddress.bind(this);
    this.listShopAddresses = this.listShopAddresses.bind(this);
    this.upsertDefaultShopAddress = this.upsertDefaultShopAddress.bind(this);
  }

  async getDefaultShopAddress(req: Request, res: Response) {
    const data = await this.shopAddressService.getDefaultShopAddress();

    res.status(200).json({
      success: true,
      message: "Default shop address fetched successfully",
      data,
    });
  }

  async listShopAddresses(req: Request, res: Response) {
    const data = await this.shopAddressService.listShopAddresses();

    res.status(200).json({
      success: true,
      message: "Shop addresses fetched successfully",
      data,
    });
  }

  async upsertDefaultShopAddress(req: Request, res: Response) {
    const data = await this.shopAddressService.upsertDefaultShopAddress(
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Default shop address saved successfully",
      data,
    });
  }
}

export default ShopAddressController;
