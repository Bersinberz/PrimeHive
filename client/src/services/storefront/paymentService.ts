import axiosInstance from "../axiosInstance";

export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  orderId: string;   // our DB _id
  orderRef: string;  // human-readable ORD-XXXXXX
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

export const createRazorpayOrder = async (orderId: string): Promise<RazorpayOrderResponse> => {
  const { data } = await axiosInstance.post("/payments/create-order", { orderId });
  return data;
};

export const verifyRazorpayPayment = async (payload: VerifyPaymentPayload): Promise<{ success: boolean; orderId: string; orderRef: string }> => {
  const { data } = await axiosInstance.post("/payments/verify", payload);
  return data;
};

/** Dynamically load the Razorpay checkout script */
export const loadRazorpayScript = (): Promise<boolean> =>
  new Promise(resolve => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id  = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
