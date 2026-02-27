import api from "./api";

const authService = {
  async login(credentials) {
    const response = await api.post("/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post("/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout() {
    await api.post("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  async getCurrentUser() {
    const response = await api.get("/user");
    return response.data;
  },

  getStoredUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem("token");
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

export default authService;
