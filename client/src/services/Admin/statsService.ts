import axiosInstance from "../axiosInstance";

export interface RevenueByDay {
    date: string;
    revenue: number;
    orders: number;
}

export interface OrdersByStatus {
    status: string;
    count: number;
}

export interface TopProduct {
    name: string;
    sold: number;
    revenue: number;
}

export interface OrdersPerDay {
    day: string;
    date: string;
    count: number;
}

export interface LowStockProduct {
    product: string;
    sku: string;
    stock: number;
    status: "Critical" | "Low";
}

export interface RecentOrder {
    _id: string;
    orderId: string;
    customer: { _id: string; name: string; email: string };
    totalAmount: number;
    status: string;
    createdAt: string;
}

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    recentOrders: RecentOrder[];
    lowStockProducts: LowStockProduct[];
    revenueByDay: RevenueByDay[];
    ordersByStatus: OrdersByStatus[];
    topProducts: TopProduct[];
    ordersPerDay: OrdersPerDay[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get("admin/stats");
    return response.data;
};

export interface AdvancedStats {
    aovByDay: { date: string; aov: number; orders: number; revenue: number }[];
    topByRevenue: { name: string; revenue: number; units: number }[];
    topBySales: { name: string; units: number; revenue: number }[];
    customerAcquisition: { date: string; newCustomers: number }[];
    conversionFunnel: { totalOrders: number; uniqueCustomers: number; avgOrdersPerCustomer: number };
    range: { from: string; to: string };
}

export const getAdvancedStats = async (params?: {
    range?: "7d" | "30d" | "90d";
    from?: string;
    to?: string;
}): Promise<AdvancedStats> => {
    const response = await axiosInstance.get("admin/stats/advanced", { params });
    return response.data;
};
