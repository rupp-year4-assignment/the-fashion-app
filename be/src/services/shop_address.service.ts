import {
  ShopAddressResponseDTO,
  UpsertShopAddressDTO,
} from "@dtos/request/shop_address.request";

export interface ShopAddressService {
  getDefaultShopAddress(): Promise<ShopAddressResponseDTO>;
  listShopAddresses(): Promise<ShopAddressResponseDTO[]>;
  upsertDefaultShopAddress(
    payload: UpsertShopAddressDTO
  ): Promise<ShopAddressResponseDTO>;
}
