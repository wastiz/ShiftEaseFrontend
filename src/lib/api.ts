import axios from "axios";
import { useServerErrorStore } from "@/zustand/server-error-state";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const orgId = localStorage.getItem("orgId");
        if (orgId) {
            config.headers["X-Organization-Id"] = orgId;
        }
    }
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    response => {
        if (useServerErrorStore.getState().isServerDown) {
            useServerErrorStore.getState().setServerDown(false);
        }
        return response;
    },
    async error => {
        const { response, config } = error;
        const originalRequest = config;

        if (!response) {
            console.error("API request failed:", error.message);
            return Promise.reject(error);
        }

        if (response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post("/auth/refresh");
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                if (typeof window !== "undefined") {
                    localStorage.removeItem("user");
                    window.location.href = "/sign-in";
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (response.status === 403) {
            console.error("Permission denied:", response.data?.message || "Forbidden");
        } else if (response.status === 404) {
            console.error("Resource not found:", response.data?.message || "Not found");
        } else if (response.status >= 500) {
            console.error("Server error:", response.data?.message || "Server error");
            useServerErrorStore.getState().setServerDown(true);
        }

        return Promise.reject(error);
    }
);

export default api;
