import { ProductVariant } from "@ctypes/product_variant";

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  brand?: string;
  category?: string;
  status?: "available" | "out_of_stock";
  variants?: ProductVariant[];
  images?: string[];
}
