import axiosInstance from './axiosInstance';

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const signupUser = async (data: SignupData): Promise<any> => {
  const response = await axiosInstance.post('/auth/signup', data);
  return response.data;
};

export const loginUser = async (data: LoginData): Promise<any> => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};