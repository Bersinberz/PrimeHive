import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getToken, removeToken } from "../utils/tokenService";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token automatically
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ✅ Centralized response handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 🔌 Network Error
    if (!error.response) {
      window.dispatchEvent(
        new CustomEvent("api-error", {
          detail: {
            status: 0,
            message: "Network error. Please check your connection.",
          },
        })
      );

      return Promise.reject({
        status: 0,
        message: "Network error",
      });
    }

    const { status, data } = error.response;

    const message =
      (data as any)?.message || "Something went wrong";

    // 🔐 401 → Logout + redirect
    if (status === 401) {
      removeToken();
      window.location.href = "/login";
      return Promise.reject({ status, message });
    }

    // 🚨 Only trigger global overlay for serious errors
    if ([403, 404, 500].includes(status)) {
      window.dispatchEvent(
        new CustomEvent("api-error", {
          detail: { status, message },
        })
      );
    }

    // ❌ 400 validation errors → handled locally in forms
    return Promise.reject({
      status,
      message,
    });
  }
);

export default axiosInstance;