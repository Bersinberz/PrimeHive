import axiosInstance from "../axiosInstance";

// Types matching the backend Order model

export type OrderStatus =
    | "Pending"
    | "Paid"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Refunded";

export interface OrderItem {
    product: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface TimelineEvent {
    status: OrderStatus;
    timestamp: string;
    note?: string;
}

export interface ShippingAddress {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface OrderCustomer {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

export interface Order {
    _id: string;
    orderId: string;
    customer: OrderCustomer;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: ShippingAddress;
    status: OrderStatus;
    timeline: TimelineEvent[];
    createdAt: string;
    updatedAt: string;
}

// Get all orders (list view — paginated)
export const getOrders = async (params?: { page?: number; limit?: number; search?: string }): Promise<Order[]> => {
    const response = await axiosInstance.get("admin/orders/get", { params });
    return response.data.data;
};

// Get single order by ID (detail view)
export const getOrderById = async (id: string): Promise<Order> => {
    const response = await axiosInstance.get(`admin/orders/get/${id}`);
    return response.data;
};

// Update order status
export const updateOrderStatus = async (
    id: string,
    status: OrderStatus,
    note?: string
): Promise<Order> => {
    const response = await axiosInstance.put(`admin/orders/status/${id}`, {
        status,
        note,
    });
    return response.data;
};
