import axiosInstance from "../axiosInstance";

export interface Staff {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: "active" | "inactive" | "deleted";
    gender?: "Male" | "Female" | "Other" | "Prefer not to say";
    dateOfBirth?: string;
    profilePicture?: string;
    isPasswordSet: boolean;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
    // Store profile
    storeName?: string;
    storeDescription?: string;
    storeLocation?: string;
    storePhone?: string;
}

export interface StaffStoreStats {
    storeName: string | null;
    storeDescription: string | null;
    storeLocation: string | null;
    storePhone: string | null;
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUnitsSold: number;
}

export interface AddStaffPayload {
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    permissions?: any;
}

export const getStaff = async (params?: { page?: number; limit?: number; search?: string }): Promise<Staff[]> => {
    const { data } = await axiosInstance.get("/admin/staff/get", { params });
    return data.data;
};

export const addStaff = async (payload: AddStaffPayload): Promise<Staff> => {
    const { data } = await axiosInstance.post("/admin/staff/add", payload);
    return data;
};

export const updateStaffStatus = async (
    id: string,
    status: "active" | "inactive"
): Promise<Staff> => {
    const { data } = await axiosInstance.put(`/admin/staff/status/${id}`, { status });
    return data;
};

export const deleteStaff = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/staff/delete/${id}`);
};

export const updateStaff = async (id: string, payload: FormData): Promise<Staff> => {
    const { data } = await axiosInstance.put(`/admin/staff/update/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
};

export const hardDeleteStaff = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/staff/hard-delete/${id}`);
};

export const resendStaffSetupEmail = async (email: string): Promise<void> => {
    await axiosInstance.post("/auth/resend-setup-email", { email });
};

export const getStaffStoreStats = async (id: string): Promise<StaffStoreStats> => {
    const { data } = await axiosInstance.get(`/admin/staff/stats/${id}`);
    return data;
};

export const revokeStaffDeletion = async (id: string): Promise<Staff> => {
    const { data } = await axiosInstance.put(`/admin/staff/revoke-deletion/${id}`);
    return data;
};
