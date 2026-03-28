import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "../utils/tokenService";

const baseURL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

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

    const isAuthEndpoint = originalRequest.url?.includes("/auth/");

    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
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

    if ([403, 404, 500].includes(status)) {
      window.dispatchEvent(
        new CustomEvent("api-error", {
          detail: { status, message }
        })
      );
    }

    return Promise.reject({
      status,
      message,
      errors: (data as any)?.errors,
    });
  }
);

export default axiosInstance;