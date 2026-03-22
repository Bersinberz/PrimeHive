import axiosInstance from "../axiosInstance";

export interface Review {
  _id: string;
  product: string;
  user: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

export interface ReviewSummary {
  reviews: Review[];
  avg: number;
  total: number;
  dist: { star: number; count: number }[];
}

export const getReviews = async (productId: string): Promise<ReviewSummary> => {
  const { data } = await axiosInstance.get(`/reviews/${productId}`);
  return data;
};

export const createReview = async (
  productId: string,
  payload: { rating: number; title: string; body: string }
): Promise<Review> => {
  const { data } = await axiosInstance.post(`/reviews/${productId}`, payload);
  return data;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await axiosInstance.delete(`/reviews/${reviewId}`);
};
