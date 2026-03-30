import axiosInstance from "../axiosInstance";

export interface DeliveryPartner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType?: string;
  vehicleNumber?: string;
  status: "active" | "inactive" | "deleted";
  createdAt: string;
}

export const getDeliveryPartners = async (): Promise<DeliveryPartner[]> => {
  const { data } = await axiosInstance.get("admin/delivery-partners");
  return data.data;
};

export const addDeliveryPartner = async (payload: { name: string; email: string; phone: string; vehicleType?: string; vehicleNumber?: string }): Promise<DeliveryPartner> => {
  const { data } = await axiosInstance.post("admin/delivery-partners", payload);
  return data;
};

export const updateDeliveryPartner = async (id: string, payload: Partial<DeliveryPartner>): Promise<DeliveryPartner> => {
  const { data } = await axiosInstance.put(`admin/delivery-partners/${id}`, payload);
  return data;
};

export const deleteDeliveryPartner = async (id: string): Promise<void> => {
  await axiosInstance.delete(`admin/delivery-partners/${id}`);
};

export const hardDeleteDeliveryPartner = async (id: string): Promise<void> => {
  await axiosInstance.delete(`admin/delivery-partners/hard/${id}`);
};

export const assignDeliveryPartner = async (orderId: string, deliveryPartnerId: string): Promise<void> => {
  await axiosInstance.post(`admin/delivery-partners/assign/${orderId}`, { deliveryPartnerId });
};
