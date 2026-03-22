export type Addresses = {
  addressType?: "USER_DELIVERY" | "SHOP_ORIGIN";
  label: string;
  street: string;
  city: string;
  state: string;
  zip?: string;
  postalCode?: string;
  country?: string;
  location: LocationMetaData;
  isDefualt: boolean;
  isDefault?: boolean;
};
