import axios from "axios";
import { useAuthStore } from "@features/auth/store/auth.store";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().setLogout();
      console.warn("[API] Unauthorized - Session cleared");
    }
    return Promise.reject(error);
  }
);

export default api;
