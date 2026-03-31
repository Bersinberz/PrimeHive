import axiosInstance from "../axiosInstance";

export interface DeliveryOrder {
  _id: string;
  orderId: string;
  customer: { name: string; phone: string; email?: string };
  items: { name: string; quantity: number; price: number; image: string }[];
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: { line1: string; line2?: string; city: string; state: string; zip: string; country: string };
  status: string;
  deliveryStatus: "assigned" | "picked_up" | "out_for_delivery" | "delivered";
  proofOfDelivery?: string;
  deliveryOtpVerified?: boolean;
  assignedAt?: string;
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

export const acceptOrder = async (id: string): Promise<void> => {
  await axiosInstance.put(`/delivery/orders/${id}/accept`);
};

export const rejectOrder = async (id: string): Promise<void> => {
  await axiosInstance.put(`/delivery/orders/${id}/reject`);
};

export const toggleOnlineStatus = async (isOnline: boolean): Promise<void> => {
  await axiosInstance.put('/delivery/status/online', { isOnline });
};

export const getMyEarnings = async (): Promise<{
  today: number; thisWeek: number; total: number; perOrder: number; todayCount: number; totalCount: number;
}> => {
  const { data } = await axiosInstance.get('/delivery/earnings');
  return data;
};

export interface DeliveryNotification {
  id: string; title: string; body: string; dot: string; time: string;
}

export const getMyNotifications = async (): Promise<DeliveryNotification[]> => {
  const { data } = await axiosInstance.get('/delivery/notifications');
  return data;
};

export const sendDeliveryOtp = async (id: string): Promise<void> => {
  await axiosInstance.post(`/delivery/orders/${id}/otp/send`);
};

export const verifyDeliveryOtp = async (id: string, otp: string): Promise<void> => {
  await axiosInstance.post(`/delivery/orders/${id}/otp/verify`, { otp });
};

export const uploadProof = async (id: string, file: File): Promise<{ proofOfDelivery: string }> => {
  const fd = new FormData();
  fd.append("proof", file);
  const { data } = await axiosInstance.post(`/delivery/orders/${id}/proof`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
