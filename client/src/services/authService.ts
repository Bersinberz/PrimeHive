import axiosInstance from './axiosInstance';

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const signupUser = async (data: SignupData): Promise<any> => {
  try {
    const response = await axiosInstance.post('/auth/signup', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
