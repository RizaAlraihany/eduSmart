import api from "@/lib/api";

const mapelService = {
  getAll: (params = {}) => api.get("/mapel", { params }).then((r) => r.data),
  getById: (id) => api.get(`/mapel/${id}`).then((r) => r.data),
  create: (payload) => api.post("/mapel", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/mapel/${id}`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/mapel/${id}`).then((r) => r.data),
};

export default mapelService;
