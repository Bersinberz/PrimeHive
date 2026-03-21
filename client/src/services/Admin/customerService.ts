import axiosInstance from "../axiosInstance";

export interface Customer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: "active" | "inactive" | "deleted";
    gender?: "Male" | "Female" | "Other" | "Prefer not to say";
    profilePicture?: string;
    addresses?: any[];
    dateOfBirth?: string;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CustomerStats {
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    cancelledOrders: number;
    lastOrderDate: string | null;
    lastOrderId: string | null;
    lastOrderStatus: string | null;
    topCategory: string | null;
}

export const getCustomers = async (params?: { page?: number; limit?: number; search?: string }): Promise<Customer[]> => {
    const { data } = await axiosInstance.get("/admin/customers/get", { params });
    return data.data;
};

export const getCustomerById = async (id: string): Promise<Customer> => {
    const { data } = await axiosInstance.get(`/admin/customers/get/${id}`);
    return data;
};

export const updateCustomerStatus = async (
    id: string,
    status: "active" | "inactive"
): Promise<Customer> => {
    const { data } = await axiosInstance.put(`/admin/customers/status/${id}`, { status });
    return data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/customers/delete/${id}`);
};

export const updateCustomer = async (id: string, payload: FormData): Promise<Customer> => {
    const { data } = await axiosInstance.put(`/admin/customers/update/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
};

export const getCustomerStats = async (id: string): Promise<CustomerStats> => {
    const { data } = await axiosInstance.get(`/admin/customers/stats/${id}`);
    return data;
};

export const hardDeleteCustomer = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/customers/hard-delete/${id}`);
};

export const revokeCustomerDeletion = async (id: string): Promise<Customer> => {
    const { data } = await axiosInstance.put(`/admin/customers/revoke-deletion/${id}`);
    return data;
};
