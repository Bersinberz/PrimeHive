import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "../utils/tokenService";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// ✅ Attach access token automatically
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ✅ Centralized response handling with silent refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(undefined);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // 🔌 Network Error
    if (!error.response) {
      window.dispatchEvent(
        new CustomEvent("api-error", {
          detail: {
            status: 0,
            message: "Network error. Please check your connection."
          }
        })
      );

      return Promise.reject({
        status: 0,
        message: "Network error"
      });
    }

    const { status, data } = error.response;
    const message = (data as any)?.message || "Something went wrong";
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 🔐 401 — Skip refresh for auth endpoints (#13)
    const isAuthEndpoint = originalRequest.url?.includes("/auth/");

    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          originalRequest.headers.Authorization = `Bearer ${getAccessToken()}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data: refreshData } = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        setAccessToken(refreshData.token);
        processQueue(null);

        originalRequest.headers.Authorization = `Bearer ${refreshData.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        clearAccessToken();
        window.location.href = "/auth";
        return Promise.reject({ status: 401, message: "Session expired" });
      } finally {
        isRefreshing = false;
      }
    }

    // 🚨 Only trigger global overlay for serious errors
    if ([403, 404, 500].includes(status)) {
      window.dispatchEvent(
        new CustomEvent("api-error", {
          detail: { status, message }
        })
      );
    }

    // ❌ All errors — handled locally in forms for 400/401
    return Promise.reject({
      status,
      message
    });
  }
);

export default axiosInstance;