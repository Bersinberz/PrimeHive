import axiosInstance from "../axiosInstance";

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface PlaceOrderPayload {
  items: OrderItemInput[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  guestEmail?: string;
}

export interface OrderConfirmation {
  _id: string;
  orderId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface MyOrder {
  _id: string;
  orderId: string;
  items: { name: string; price: number; quantity: number; image: string }[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: ShippingAddress;
}

export const placeOrder = async (payload: PlaceOrderPayload): Promise<OrderConfirmation> => {
  const { data } = await axiosInstance.post("/orders", payload);
  return data;
};

export const getMyOrders = async (page = 1): Promise<{ data: MyOrder[]; pagination: { total: number; totalPages: number } }> => {
  const { data } = await axiosInstance.get("/orders/my", { params: { page } });
  return data;
};

export const getMyOrderById = async (id: string): Promise<MyOrder> => {
  const { data } = await axiosInstance.get(`/orders/my/${id}`);
  return data;
};
