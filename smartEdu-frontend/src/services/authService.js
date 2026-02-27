import api from "./api";

const authService = {
  /**
   * Get CSRF Cookie dari Laravel Sanctum
   * WAJIB dipanggil sebelum login/register
   */
  async getCsrfCookie() {
    await api.get("/sanctum/csrf-cookie");
  },

  /**
   * Login user
   */
  async login(credentials) {
    await this.getCsrfCookie();

    const response = await api.post("/api/login", credentials);

    if (response.data.data && response.data.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  /**
   * Register user baru
   */
  async register(userData) {
    await this.getCsrfCookie();

    const response = await api.post("/api/register", userData);

    if (response.data.data && response.data.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await api.post("/api/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const response = await api.get("/api/user");
    return response.data;
  },

  /**
   * Get stored user dari localStorage
   */
  getStoredUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check apakah user sudah login
   * Untuk cookie-based, kita cek apakah ada user di localStorage
   */
  isAuthenticated() {
    return !!this.getStoredUser();
  },
};

export default authService;
