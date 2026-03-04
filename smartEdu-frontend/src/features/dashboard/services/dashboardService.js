import api from "@/lib/api";

const dashboardService = {
  getAdmin: () => api.get("/dashboard/admin").then((r) => r.data),
  getGuru: () => api.get("/dashboard/guru").then((r) => r.data),
  getSiswa: () => api.get("/dashboard/siswa").then((r) => r.data),
  getStats: () => api.get("/dashboard").then((r) => r.data),
};

export default dashboardService;
