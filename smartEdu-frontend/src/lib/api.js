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
// PERBAIKAN: Hapus window.location.replace() dari sini.
// Hard redirect via window.location bypass React Router sepenuhnya,
// menyebabkan app re-mount dari nol → AuthProvider restore() dipanggil ulang
// → GET /api/user → 401 lagi → dispatch auth:logout → redirect lagi → LOOP.
//
// Solusi: gunakan CustomEvent saja. Biarkan AuthProvider + React Router
// (ProtectedRoute / GuestRoute) yang handle redirect secara reaktif.
//
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Sesi habis atau tidak terautentikasi.
      // AuthProvider listen event ini → setUser(null) → isAuthenticated = false
      // → ProtectedRoute otomatis redirect ke /login via React Router.
      window.dispatchEvent(new CustomEvent("auth:logout"));
      return Promise.reject(error);
    }

    if (status === 403) {
      // Authenticated tapi tidak punya akses ke resource ini.
      // AppRoutes listen event ini → navigate ke /dashboard/unauthorized.
      window.dispatchEvent(new CustomEvent("auth:forbidden"));
      return Promise.reject(error);
    }

    if (status === 500) {
      // Log ke console untuk debugging — jangan tampilkan detail ke user.
      console.error(
        "[API 500]",
        error.response?.data?.message ?? "Internal server error",
      );
    }

    return Promise.reject(error);
  },
);

/**
 * Ambil CSRF cookie dari Sanctum sebelum POST pertama (login/register).
 * Dipanggil dari authService, bukan langsung dari komponen.
 */
export const getCsrfCookie = () =>
  axios.get(`${BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });

export default api;
