import api from "@/lib/api";

const jadwalService = {
  getAll: (params = {}) => api.get("/jadwal", { params }).then((r) => r.data),
  getById: (id) => api.get(`/jadwal/${id}`).then((r) => r.data),
  create: (payload) => api.post("/jadwal", payload).then((r) => r.data),
  update: (id, payload) =>
    api.put(`/jadwal/${id}`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/jadwal/${id}`).then((r) => r.data),
};

export default jadwalService;
