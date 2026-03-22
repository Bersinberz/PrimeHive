import axiosInstance from "../axiosInstance";

export interface Offer {
  _id: string;
  label: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  productIds: string[];
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OfferPayload {
  label: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  productIds?: string[];
}

export const getOffers = (): Promise<Offer[]> =>
  axiosInstance.get("/admin/offers").then(r => r.data);

export const getOfferById = (id: string): Promise<Offer> =>
  axiosInstance.get(`/admin/offers/${id}`).then(r => r.data);

export const createOffer = (data: OfferPayload): Promise<Offer> =>
  axiosInstance.post("/admin/offers", data).then(r => r.data);

export const updateOffer = (id: string, data: Partial<OfferPayload>): Promise<Offer> =>
  axiosInstance.put(`/admin/offers/${id}`, data).then(r => r.data);

export const deleteOffer = (id: string): Promise<void> =>
  axiosInstance.delete(`/admin/offers/${id}`).then(() => undefined);
