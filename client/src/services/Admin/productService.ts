import axiosInstance from "../axiosInstance";

// Reuse the create payload
export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  sku: string;
  stock: number;
  images: File[];
}

// Product type returned by the API
export interface ProductCreator {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  storeName?: string;
  storeDescription?: string;
  storeLocation?: string;
  storePhone?: string;
  profilePicture?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  sku: string;
  stock: number;
  status: "active" | "draft" | "archived";
  images: string[];
  createdBy?: ProductCreator;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==========================================
// Helpers
// ==========================================

const buildProductFormData = (payload: CreateProductPayload): FormData => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("price", payload.price.toString());
  formData.append("category", payload.category);
  formData.append("sku", payload.sku);
  formData.append("stock", payload.stock.toString());
  if (payload.comparePrice) {
    formData.append("comparePrice", payload.comparePrice.toString());
  }
  payload.images.forEach((image) => formData.append("images", image));
  return formData;
};

// Create product
export const createProduct = async (
  payload: CreateProductPayload
): Promise<Product> => {
  const response = await axiosInstance.post(
    "admin/products/create",
    buildProductFormData(payload),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const getProducts = async (params?: { page?: number; limit?: number; search?: string }): Promise<Product[]> => {
  const response = await axiosInstance.get("admin/products/get", { params });
  return response.data.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await axiosInstance.get(`admin/products/get/${id}`);
  return response.data;
};


export const updateProduct = async (id: string, payload: CreateProductPayload): Promise<Product> => {
  const response = await axiosInstance.put(`admin/products/update/${id}`, buildProductFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Delete product
export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(`admin/products/delete/${id}`);
};