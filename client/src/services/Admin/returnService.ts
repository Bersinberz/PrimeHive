import axiosInstance from "../axiosInstance";

export interface AdminReturn {
  _id: string;
  order: { _id: string; orderId: string; totalAmount: number };
  customer: { _id: string; name: string; email: string };
  items: { product: string; name: string; quantity: number; price: number }[];
  reason: string;
  status: "requested" | "approved" | "rejected" | "completed";
  adminNote?: string;
  createdAt: string;
}

export const getAdminReturns = async (params?: { page?: number; limit?: number; status?: string }): Promise<{ data: AdminReturn[]; pagination: any }> => {
  const { data } = await axiosInstance.get("admin/returns", { params });
  return data;
};

export const processReturn = async (id: string, status: "approved" | "rejected" | "completed", adminNote?: string): Promise<AdminReturn> => {
  const { data } = await axiosInstance.put(`admin/returns/${id}`, { status, adminNote });
  return data;
};
