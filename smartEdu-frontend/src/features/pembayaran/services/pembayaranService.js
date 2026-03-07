import api from "@/lib/api";

const pembayaranService = {
  getAll: (params = {}) =>
    api.get("/pembayaran", { params }).then((r) => r.data),
  getById: (id) => api.get(`/pembayaran/${id}`).then((r) => r.data),
  create: (payload) => api.post("/pembayaran", payload).then((r) => r.data),
  update: (id, payload) =>
    api.put(`/pembayaran/${id}`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/pembayaran/${id}`).then((r) => r.data),
};

export default pembayaranService;
