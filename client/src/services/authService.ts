import axiosInstance from "./axiosInstance";

// ==========================================
// Types
// ==========================================

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Permissions {
  dashboard:  { view: boolean };
  products:   { view: boolean; create: boolean; edit: boolean; delete: boolean };
  categories: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  orders:     { view: boolean; updateStatus: boolean };
  customers:  { view: boolean; edit: boolean; delete: boolean };
  staff:      { view: boolean; create: boolean; edit: boolean; delete: boolean };
  settings:   { view: boolean; edit: boolean };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  role: string;
  permissions?: Permissions | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface RefreshResponse {
  token: string;
  user: AuthUser;
}

// ==========================================
// API Calls
// ==========================================

export const signupUser = async (data: SignupData): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/signup", data);
  return response.data;
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

export const refreshSession = async (): Promise<RefreshResponse> => {
  const response = await axiosInstance.post("/auth/refresh");
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await axiosInstance.post("/auth/logout");
};

export const updateMyProfile = async (formData: FormData): Promise<AuthUser> => {
  const { data } = await axiosInstance.put("/admin/settings/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // Map _id → id for consistency
  return { ...data, id: data._id ?? data.id };
};

export const changeMyPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await axiosInstance.put("/admin/settings/change-password", { currentPassword, newPassword });
};

export const setPasswordApi = async (token: string, newPassword: string): Promise<void> => {
  await axiosInstance.post("/auth/set-password", { token, newPassword });
};

export const resendSetupEmailApi = async (email: string): Promise<void> => {
  await axiosInstance.post("/auth/resend-setup-email", { email });
};

export const getMyProfile = async (): Promise<{ name: string; email: string; phone: string; dateOfBirth?: string; gender?: string; profilePicture?: string }> => {
  const { data } = await axiosInstance.get("/admin/settings/me");
  return data;
};

export const getNotificationPreferences = async (): Promise<{ orderPlaced: boolean; lowStock: boolean }> => {  const { data } = await axiosInstance.get("/admin/settings/notifications");
  return data;
};

export const updateNotificationPreferences = async (prefs: { orderPlaced: boolean; lowStock: boolean }): Promise<void> => {
  await axiosInstance.put("/admin/settings/notifications", prefs);
};

export const deleteMyAccount = async (password: string): Promise<void> => {
  await axiosInstance.delete("/admin/settings/account", { data: { password } });
};

export const revokeAllSessions = async (): Promise<void> => {
  await axiosInstance.post("/admin/settings/revoke-all-sessions");
};

export const forgotPasswordApi = async (email: string): Promise<void> => {
  await axiosInstance.post("/auth/forgot-password", { email });
};

export const resetPasswordApi = async (token: string, newPassword: string): Promise<void> => {
  await axiosInstance.post("/auth/reset-password", { token, newPassword });
};
