import { LocationMetaData } from "@ctypes/location";

export class OrdersItem {
  productId!: string;
  variantId!: string;
  size!: string;
  color!: string;
  price!: number;
  quantity!: number;
  productName!: string;
}

export interface CreateOrderDTO {
  userId: string;
  item: OrdersItem[];
  delivery: {
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      location: LocationMetaData;
    };
    courier: string;
  };
}
