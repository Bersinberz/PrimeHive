import axiosInstance from "../axiosInstance";

export interface Staff {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: "active" | "inactive" | "banned";
    createdAt: string;
    updatedAt: string;
}

export interface AddStaffPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
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
    status: "active" | "inactive" | "banned"
): Promise<Staff> => {
    const { data } = await axiosInstance.put(`/admin/staff/status/${id}`, { status });
    return data;
};

export const deleteStaff = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/staff/delete/${id}`);
};
