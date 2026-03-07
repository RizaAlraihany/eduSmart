import axios from "axios";

/**
 * FIX: Pisahkan BASE_URL dan SANCTUM_URL.
 *
 * Sebelumnya getCsrfCookie() menggunakan BASE_URL langsung.
 * Jika suatu saat backend dipindah ke subdomain berbeda (misal api.smartedu.com)
 * sedangkan CSRF endpoint ada di sanctum.smartedu.com, akan pecah.
 *
 * Sekarang: VITE_SANCTUM_URL dikontrol terpisah via .env.
 * Default fallback ke BASE_URL (backward compatible).
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const SANCTUM_URL = import.meta.env.VITE_SANCTUM_URL ?? BASE_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// ── Request interceptor: inject XSRF-TOKEN dari Sanctum cookie ──────────────
api.interceptors.request.use(
  (config) => {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (raw) {
      config.headers["X-XSRF-TOKEN"] = decodeURIComponent(raw);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle error global ────────────────────────────────
//
// PENTING: Jangan pakai window.location.replace() di sini.
// Hard redirect bypass React Router → app re-mount → restore() dipanggil ulang
// → GET /api/user → 401 → auth:logout → redirect lagi → INFINITE LOOP.
//
// Solusi: CustomEvent saja. AuthProvider + ProtectedRoute handle redirect reaktif.
//
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Sesi habis / tidak terautentikasi.
      // AuthProvider listen → setUser(null) → ProtectedRoute redirect ke /login.
      window.dispatchEvent(new CustomEvent("auth:logout"));
      return Promise.reject(error);
    }

    if (status === 403) {
      // Authenticated tapi tidak punya akses.
      // AppRoutes listen → navigate ke /dashboard/unauthorized.
      window.dispatchEvent(new CustomEvent("auth:forbidden"));
      return Promise.reject(error);
    }

    if (status === 500) {
      console.error(
        "[API 500]",
        error.response?.data?.message ?? "Internal server error",
      );
    }

    return Promise.reject(error);
  },
);

/**
 * Ambil CSRF cookie dari Sanctum sebelum POST login/register.
 * FIX: Menggunakan SANCTUM_URL terpisah dari BASE_URL.
 */
export const getCsrfCookie = () =>
  axios.get(`${SANCTUM_URL}/sanctum/csrf-cookie`, { withCredentials: true });

export default api;
