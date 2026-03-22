import { ProductVariant } from "@ctypes/product_variant";

export interface createProductDTO {
  name: string;
  description: string;
  brand: string;
  category: string;
  status: "available" | "out_of_stock";
  variants: ProductVariant[];
  images?: string[];
}
