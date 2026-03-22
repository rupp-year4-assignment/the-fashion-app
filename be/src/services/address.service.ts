import {
  AddressResponseDTO,
  CreateAddressDTO,
  UpdateAddressDTO,
} from "@dtos/request/address.request";
import { ObjectId } from "mongoose";

export interface AddressService {
  getAddressesByUser(userId: ObjectId): Promise<AddressResponseDTO[]>;
  addAddress(
    userId: ObjectId,
    payload: CreateAddressDTO
  ): Promise<AddressResponseDTO>;
  updateAddress(
    userId: ObjectId,
    addressId: string,
    payload: UpdateAddressDTO
  ): Promise<AddressResponseDTO>;
  removeAddress(userId: ObjectId, addressId: string): Promise<void>;
  setDefaultAddress(
    userId: ObjectId,
    addressId: string
  ): Promise<AddressResponseDTO>;
}
