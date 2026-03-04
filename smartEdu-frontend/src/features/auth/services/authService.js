import api, { getCsrfCookie } from "../../../lib/api";

const authService = {
  /**
   * Login flow:
   * 1. Ambil CSRF cookie dari Sanctum (/sanctum/csrf-cookie)
   * 2. POST /api/login dengan credentials
   * 3. Return raw response.data — AuthProvider yang handle setUser()
   *
   * Expected backend response:
   * { success: true, message: "Login berhasil", data: { user: { id, name, email, role } } }
   */
  login: async (credentials) => {
    await getCsrfCookie();
    const response = await api.post("/login", credentials);
    return response.data;
  },

  /**
   * Register flow:
   * 1. Ambil CSRF cookie dari Sanctum
   * 2. POST /api/register dengan data user baru
   * 3. Return raw response.data
   *
   * Expected backend response:
   * { success: true, message: "Registrasi berhasil", data: { user: { id, name, email, role } } }
   */
  register: async (userData) => {
    await getCsrfCookie();
    const response = await api.post("/register", userData);
    return response.data;
  },

  /**
   * Logout: invalidate session di backend.
   * Jika request gagal (session sudah expired), tetap lanjut — tidak throw.
   * AuthProvider yang handle setUser(null) setelah ini dipanggil.
   */
  logout: async () => {
    try {
      await api.post("/logout");
    } catch {
      // Session sudah tidak valid di server — lanjut saja
    }
  },

  /**
   * Cek & restore sesi aktif via server.
   * Dipanggil SEKALI oleh AuthProvider saat app mount.
   * Throw 401 jika tidak ada sesi → AuthProvider catch → setUser(null).
   *
   * Expected backend response:
   * { success: true, data: { id, name, email, role } }
   */
  getCurrentUser: async () => {
    const response = await api.get("/user");
    // Backend GET /api/user return: { success: true, data: user }
    return response.data?.data ?? response.data;
  },
};

export default authService;
