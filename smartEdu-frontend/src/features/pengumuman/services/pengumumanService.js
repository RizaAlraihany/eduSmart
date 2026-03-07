import api from "@/lib/api";

const pengumumanService = {
  getAll: (params = {}) =>
    api.get("/pengumuman", { params }).then((r) => r.data),
  getById: (id) => api.get(`/pengumuman/${id}`).then((r) => r.data),
  create: (payload) => api.post("/pengumuman", payload).then((r) => r.data),
  update: (id, payload) =>
    api.put(`/pengumuman/${id}`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/pengumuman/${id}`).then((r) => r.data),
};

export default pengumumanService;
