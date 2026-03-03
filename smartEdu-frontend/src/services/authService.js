import api, { getCsrfCookie } from "./api";

const authService = {
  /**
   * Login: ambil CSRF cookie dulu, lalu kirim credentials ke backend
   */
  login: async (credentials) => {
    // Ambil CSRF Cookie dari Sanctum
    // Route ini ada di /sanctum/csrf-cookie (BUKAN /api/sanctum/csrf-cookie)
    await getCsrfCookie();

    // Kirim request login ke API
    const response = await api.post("/login", credentials);
    // Step 3: Simpan data user ke localStorage untuk persistensi
    if (response.data?.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  /**
   * Register: ambil CSRF cookie dulu, lalu kirim data registrasi
   */
  register: async (userData) => {
    await getCsrfCookie();

    const response = await api.post("/register", userData);

    if (response.data?.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  /**
   * Logout: hapus session di backend dan bersihkan localStorage
   */
  logout: async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      // Tetap lanjut logout meski request gagal
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("user");
    }
  },

  /**
   * Ambil data user yang sedang login dari backend (untuk validasi session)
   */
  getCurrentUser: async () => {
    const response = await api.get("/user");
    // Update localStorage dengan data terbaru
    localStorage.setItem("user", JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Ambil data user dari localStorage (tidak hit backend)
   */
  getStoredUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Cek apakah user dianggap authenticated berdasarkan localStorage
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("user");
  },
};

export default authService;
