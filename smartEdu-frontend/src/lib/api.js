/**
 * src/lib/api.js
 * Axios instance tunggal. SEMUA request API wajib lewat sini.
 * Interceptors: inject XSRF-TOKEN, handle 401/403/500
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Inject XSRF-TOKEN dari Sanctum cookie
api.interceptors.request.use(
  (config) => {
    const raw = document.cookie
      .split("; ")
      .find((r) => r.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];
    if (raw) config.headers["X-XSRF-TOKEN"] = decodeURIComponent(raw);
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 / 403 / 500
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Session expired — beritahu AuthProvider via event, lalu redirect
      window.dispatchEvent(new CustomEvent("auth:logout"));
      window.location.replace("/login");
      return Promise.reject(error);
    }

    if (status === 403) {
      // Authenticated tapi tidak punya akses
      window.location.replace("/dashboard/unauthorized");
      return Promise.reject(error);
    }

    if (status === 500) {
      console.error(
        "[API 500]",
        error.response?.data?.message ?? "Server error",
      );
    }

    return Promise.reject(error);
  },
);

export const getCsrfCookie = () =>
  axios.get(`${BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });

export default api;
