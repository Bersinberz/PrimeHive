import axiosInstance from "../axiosInstance";

export interface ReturnItem {
  productId: string;
  quantity: number;
}

export interface ReturnRequest {
  _id: string;
  order: { _id: string; orderId: string; totalAmount: number; createdAt: string };
  items: { product: string; name: string; quantity: number; price: number }[];
  reason: string;
  status: "requested" | "approved" | "rejected" | "completed";
  adminNote?: string;
  createdAt: string;
}

export const createReturn = async (orderId: string, reason: string, items: ReturnItem[]): Promise<ReturnRequest> => {
  const { data } = await axiosInstance.post("/returns", { orderId, reason, items });
  return data;
};

export const getMyReturns = async (): Promise<ReturnRequest[]> => {
  const { data } = await axiosInstance.get("/returns/my");
  return data;
};
