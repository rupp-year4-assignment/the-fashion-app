export interface FilterProductDTO {
  name?: string;
  brand?: string;
  category?: string;
  status?: "available" | "out_of_stock";
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
