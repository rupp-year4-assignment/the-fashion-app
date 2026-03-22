export type AddressType = "USER_DELIVERY" | "SHOP_ORIGIN";

export interface AddressLocationDTO {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface CreateAddressDTO {
  addressType?: AddressType;
  label?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location: AddressLocationDTO;
  isDefault?: boolean;
}

export interface UpdateAddressDTO {
  addressType?: AddressType;
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  location?: AddressLocationDTO;
  isDefault?: boolean;
}

export interface AddressResponseDTO {
  id: string;
  addressType: AddressType;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location: AddressLocationDTO;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
