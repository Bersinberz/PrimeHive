// axiosInstance.ts
import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      window.dispatchEvent(new CustomEvent('api-error', { 
        detail: { status: 0, message: "Network error. Please check your connection." } 
      }));
      return Promise.reject({ message: "Network error." });
    }

    const { status, data } = error.response;

    window.dispatchEvent(new CustomEvent('api-error', { 
      detail: { status, message: (data as any)?.message || "Something went wrong" } 
    }));

    return Promise.reject(data);
  }
);

export default axiosInstance;