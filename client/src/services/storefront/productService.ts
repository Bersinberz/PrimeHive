import axiosInstance from "../axiosInstance";

export interface StorefrontProduct {
  _id: string;
  name: string;
  price: number;
  comparePrice?: number;
  category: string;
  images: string[];
  stock: number;
  status: string;
  description?: string;
  sku?: string;
  sellerName?: string;
  createdAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "oldest" | "price-asc" | "price-desc";
}

export interface PaginatedProducts {
  data: StorefrontProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Category {
  _id: string;
  name: string;
  description: string;
}

export const getProducts = async (filters?: ProductFilters): Promise<PaginatedProducts> => {
  const { data } = await axiosInstance.get("/products", { params: filters });
  return data;
};

export const getProductById = async (id: string): Promise<StorefrontProduct> => {
  const { data } = await axiosInstance.get(`/products/${id}`);
  return data;
};

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await axiosInstance.get("/categories");
  return data;
};
