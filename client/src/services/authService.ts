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

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
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