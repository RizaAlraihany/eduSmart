import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // WAJIB untuk Sanctum SPA Cookie Auth
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Request interceptor — baca XSRF-TOKEN dari cookie dan kirim sebagai header
api.interceptors.request.use(
  (config) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (token) {
      config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — jika 401, arahkan ke halaman login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ✅ FIX: BASE_URL sudah terdefinisi di atas, fungsi ini sekarang benar
// Route CSRF ada di /sanctum/csrf-cookie (BUKAN /api/sanctum/csrf-cookie)
export const getCsrfCookie = () =>
  axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });

export default api;
