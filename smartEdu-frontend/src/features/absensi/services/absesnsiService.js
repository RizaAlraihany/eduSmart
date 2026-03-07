import api from "@/lib/api";

const absensiService = {
  getAll: (params = {}) => api.get("/absensi", { params }).then((r) => r.data),
  getById: (id) => api.get(`/absensi/${id}`).then((r) => r.data),
  create: (payload) => api.post("/absensi", payload).then((r) => r.data),
  update: (id, payload) =>
    api.put(`/absensi/${id}`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/absensi/${id}`).then((r) => r.data),
};

export default absensiService;
