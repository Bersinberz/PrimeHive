import axiosInstance from "../axiosInstance";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  emailVerified?: boolean;
}

export interface Address {
  _id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export const getProfile = async (): Promise<UserProfile> => {
  const { data } = await axiosInstance.get("/auth/profile");
  return data;
};

export const updateProfile = async (formData: FormData): Promise<{ user: UserProfile }> => {
  const { data } = await axiosInstance.put("/auth/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await axiosInstance.put("/auth/change-password", { currentPassword, newPassword });
};

export const getAddresses = async (): Promise<Address[]> => {
  const { data } = await axiosInstance.get("/auth/addresses");
  return data;
};

export const addAddress = async (address: Omit<Address, "_id">): Promise<Address> => {
  const { data } = await axiosInstance.post("/auth/addresses", address);
  return data;
};

export const updateAddress = async (id: string, address: Partial<Omit<Address, "_id">>): Promise<Address> => {
  const { data } = await axiosInstance.put(`/auth/addresses/${id}`, address);
  return data;
};

export const deleteAddress = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/auth/addresses/${id}`);
};

export const deactivateAccount = async (password: string): Promise<void> => {
  await axiosInstance.delete("/auth/account", { data: { password, action: "deactivate" } });
};

export const deleteAccount = async (password: string): Promise<void> => {
  await axiosInstance.delete("/auth/account", { data: { password, action: "delete" } });
};

export const sendVerificationEmail = async (): Promise<void> => {
  await axiosInstance.post("/auth/send-verification");
};
