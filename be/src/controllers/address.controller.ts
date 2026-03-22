import { IUser } from "@models/user";
import { AddressService } from "@services/address.service";
import { Request, Response } from "express";

class AddressController {
  constructor(private readonly addressService: AddressService) {
    this.getAddresses = this.getAddresses.bind(this);
    this.addAddress = this.addAddress.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.removeAddress = this.removeAddress.bind(this);
    this.setDefaultAddress = this.setDefaultAddress.bind(this);
  }

  async getAddresses(req: Request, res: Response) {
    const user = req.user as IUser;
    const data = await this.addressService.getAddressesByUser(user._id as any);

    res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data,
    });
  }

  async addAddress(req: Request, res: Response) {
    const user = req.user as IUser;
    const data = await this.addressService.addAddress(user._id as any, req.body);

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data,
    });
  }

  async updateAddress(req: Request, res: Response) {
    const user = req.user as IUser;
    const addressId = req.params.addressId as string;
    const data = await this.addressService.updateAddress(
      user._id as any,
      addressId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data,
    });
  }

  async removeAddress(req: Request, res: Response) {
    const user = req.user as IUser;
    const addressId = req.params.addressId as string;
    await this.addressService.removeAddress(user._id as any, addressId);

    res.status(200).json({
      success: true,
      message: "Address removed successfully",
    });
  }

  async setDefaultAddress(req: Request, res: Response) {
    const user = req.user as IUser;
    const addressId = req.params.addressId as string;
    const data = await this.addressService.setDefaultAddress(
      user._id as any,
      addressId
    );

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data,
    });
  }
}

export default AddressController;
