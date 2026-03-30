import axiosInstance from "../axiosInstance";

export interface AdminStaffPermissions {
  staff:     { view: boolean };
  orders:    { view: boolean; updateStatus: boolean };
  customers: { view: boolean; edit: boolean };
  offers:    { view: boolean; create: boolean; edit: boolean; delete: boolean };
  reviews:   { view: boolean; moderate: boolean; delete: boolean };
  returns:   { view: boolean; process: boolean };
}

export interface AdminStaffMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "deleted";
  adminStaffPermissions: AdminStaffPermissions;
  createdAt: string;
}

export const DEFAULT_ADMIN_STAFF_PERMISSIONS: AdminStaffPermissions = {
  staff:     { view: false },
  orders:    { view: true,  updateStatus: false },
  customers: { view: true,  edit: false },
  offers:    { view: true,  create: false, edit: false, delete: false },
  reviews:   { view: true,  moderate: false, delete: false },
  returns:   { view: true,  process: false },
};

export const getAdminStaff = async (): Promise<AdminStaffMember[]> => {
  const { data } = await axiosInstance.get("admin/admin-staff");
  return data.data;
};

export const addAdminStaff = async (payload: { name: string; email: string; phone: string; adminStaffPermissions: AdminStaffPermissions }): Promise<AdminStaffMember> => {
  const { data } = await axiosInstance.post("admin/admin-staff", payload);
  return data;
};

export const updateAdminStaff = async (id: string, payload: Partial<AdminStaffMember & { adminStaffPermissions: AdminStaffPermissions }>): Promise<AdminStaffMember> => {
  const { data } = await axiosInstance.put(`admin/admin-staff/${id}`, payload);
  return data;
};

export const deleteAdminStaff = async (id: string): Promise<void> => {
  await axiosInstance.delete(`admin/admin-staff/${id}`);
};

export const hardDeleteAdminStaff = async (id: string): Promise<void> => {
  await axiosInstance.delete(`admin/admin-staff/hard/${id}`);
};
