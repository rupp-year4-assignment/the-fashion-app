import { AddressLocationDTO } from "./address.request";

export interface UpsertShopAddressDTO {
  label?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location: AddressLocationDTO;
}

export interface ShopAddressResponseDTO {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location: AddressLocationDTO;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
