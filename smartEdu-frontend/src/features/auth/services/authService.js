import api, { getCsrfCookie } from "@/lib/api";

const authService = {
  login: async (credentials) => {
    await getCsrfCookie();
    const response = await api.post("/login", credentials);
    return response.data;
  },

  register: async (userData) => {
    await getCsrfCookie();
    const response = await api.post("/register", userData);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/logout");
    } catch {
      // Session sudah tidak valid di server — lanjut saja
    }
  },

  
  getCurrentUser: async () => {
    const response = await api.get("/user");
    return response.data?.data ?? response.data;
  },
};

export default authService;
