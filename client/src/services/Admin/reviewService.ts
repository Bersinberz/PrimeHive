import axiosInstance from "../axiosInstance";

export interface AdminReview {
  _id: string;
  product: { _id: string; name: string; images: string[] };
  user: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export const getAdminReviews = async (params?: { page?: number; limit?: number; status?: string }): Promise<{ data: AdminReview[]; pagination: any }> => {
  const { data } = await axiosInstance.get("admin/reviews", { params });
  return data;
};

export const moderateReview = async (id: string, status: "approved" | "rejected"): Promise<AdminReview> => {
  const { data } = await axiosInstance.put(`admin/reviews/${id}`, { status });
  return data;
};

export const deleteAdminReview = async (id: string): Promise<void> => {
  await axiosInstance.delete(`admin/reviews/${id}`);
};
