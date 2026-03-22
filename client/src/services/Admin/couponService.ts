import axiosInstance from "../axiosInstance";

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  usageLimit?: number;
  usageCount: number;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponPayload {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  usageLimit?: number;
  expiryDate?: string;
  isActive: boolean;
}

export const getCoupons = (): Promise<Coupon[]> =>
  axiosInstance.get("/admin/coupons").then(r => r.data);

export const createCoupon = (data: CouponPayload): Promise<Coupon> =>
  axiosInstance.post("/admin/coupons", data).then(r => r.data);

export const updateCoupon = (id: string, data: Partial<CouponPayload>): Promise<Coupon> =>
  axiosInstance.put(`/admin/coupons/${id}`, data).then(r => r.data);

export const deleteCoupon = (id: string): Promise<void> =>
  axiosInstance.delete(`/admin/coupons/${id}`).then(() => undefined);
