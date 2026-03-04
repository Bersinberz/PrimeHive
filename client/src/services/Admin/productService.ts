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
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  sku: string;
  stock: number;
  images: string[];
}

// Create product
export const createProduct = async (
  payload: CreateProductPayload
): Promise<Product> => {
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

  payload.images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await axiosInstance.post(
    "admin/products/create",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await axiosInstance.get("admin/products/get");
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await axiosInstance.get(`admin/products/get/${id}`);
  return response.data;
};


export const updateProduct = async (id: string, payload: CreateProductPayload): Promise<Product> => {
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

  payload.images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await axiosInstance.put(`admin/products/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Delete product
export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(`admin/products/delete/${id}`);
};