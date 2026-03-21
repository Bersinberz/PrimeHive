import axiosInstance from "../axiosInstance";

export interface CartItem {
  product: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export interface Cart {
  items: CartItem[];
}

export interface GuestCartItem {
  productId: string;
  quantity: number;
}

export const getCart = async (): Promise<Cart> => {
  const { data } = await axiosInstance.get("/cart");
  return data;
};

export const syncCart = async (items: GuestCartItem[]): Promise<Cart> => {
  const { data } = await axiosInstance.post("/cart/sync", { items });
  return data;
};

export const addToCart = async (productId: string, quantity = 1): Promise<Cart> => {
  const { data } = await axiosInstance.post("/cart/items", { productId, quantity });
  return data;
};

export const updateCartItem = async (productId: string, quantity: number): Promise<Cart> => {
  const { data } = await axiosInstance.put(`/cart/items/${productId}`, { quantity });
  return data;
};

export const removeCartItem = async (productId: string): Promise<Cart> => {
  const { data } = await axiosInstance.delete(`/cart/items/${productId}`);
  return data;
};

export const clearServerCart = async (): Promise<void> => {
  await axiosInstance.delete("/cart");
};
