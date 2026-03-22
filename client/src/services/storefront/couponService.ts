import axiosInstance from "../axiosInstance";

export interface CouponValidationResult {
  couponId: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  couponDiscount: number;
}

export const validateCoupon = (code: string, orderTotal: number): Promise<CouponValidationResult> =>
  axiosInstance.post("/coupons/validate", { code, orderTotal }).then(r => r.data);
