import axiosInstance from './axiosInstance';

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth?: string;
}

export const signupUser = async (data: SignupData): Promise<any> => {
  const response = await axiosInstance.post('/auth/signup', data);
  return response.data;
};