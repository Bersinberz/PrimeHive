import axiosInstance from "../axiosInstance";

export interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  status: string;
  category: string;
}

export const getWishlist = async (): Promise<WishlistProduct[]> => {
  const { data } = await axiosInstance.get("/wishlist");
  return data;
};

export const addToWishlist = async (productId: string): Promise<WishlistProduct[]> => {
  const { data } = await axiosInstance.post("/wishlist", { productId });
  return data;
};

export const removeFromWishlist = async (productId: string): Promise<WishlistProduct[]> => {
  const { data } = await axiosInstance.delete(`/wishlist/${productId}`);
  return data;
};

export const clearWishlist = async (): Promise<void> => {
  await axiosInstance.delete("/wishlist");
};
