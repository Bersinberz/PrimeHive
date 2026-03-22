import axiosInstance from "../axiosInstance";

export interface OfferProduct {
  _id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  category: string;
  discountedPrice: number;
}

export interface ActiveOfferBanner {
  _id: string;
  label: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  endDate?: string;
  products: OfferProduct[];
}

export const getActiveOffers = (): Promise<ActiveOfferBanner[]> =>
  axiosInstance.get("/offers/active").then(r => r.data);
