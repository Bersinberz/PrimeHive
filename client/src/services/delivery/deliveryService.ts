import axiosInstance from "../axiosInstance";

export interface DeliveryOrder {
  _id: string;
  orderId: string;
  customer: { name: string; phone: string; email?: string };
  items: { name: string; quantity: number; price: number; image: string }[];
  totalAmount: number;
  shippingAddress: { line1: string; line2?: string; city: string; state: string; zip: string; country: string };
  status: string;
  deliveryStatus: "assigned" | "picked_up" | "out_for_delivery" | "delivered";
  proofOfDelivery?: string;
  createdAt: string;
}

export const getMyDeliveries = async (params?: { deliveryStatus?: string; page?: number }): Promise<{ data: DeliveryOrder[]; pagination: any }> => {
  const { data } = await axiosInstance.get("/delivery/orders", { params });
  return data;
};

export const getDeliveryOrderById = async (id: string): Promise<DeliveryOrder> => {
  const { data } = await axiosInstance.get(`/delivery/orders/${id}`);
  return data;
};

export const updateDeliveryStatus = async (id: string, deliveryStatus: string): Promise<void> => {
  await axiosInstance.put(`/delivery/orders/${id}/status`, { deliveryStatus });
};

export const uploadProof = async (id: string, file: File): Promise<{ proofOfDelivery: string }> => {
  const fd = new FormData();
  fd.append("proof", file);
  const { data } = await axiosInstance.post(`/delivery/orders/${id}/proof`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
