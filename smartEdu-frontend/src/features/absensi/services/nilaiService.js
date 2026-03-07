import api from "@/lib/api";

const nilaiService = {
  getAll:  (params = {}) => api.get("/nilai", { params }).then((r) => r.data),
  getById: (id)          => api.get(`/nilai/${id}`).then((r) => r.data),
  create:  (payload)     => api.post("/nilai", payload).then((r) => r.data),
  update:  (id, payload) => api.put(`/nilai/${id}`, payload).then((r) => r.data),
  delete:  (id)          => api.delete(`/nilai/${id}`).then((r) => r.data),
};

export default nilaiService;
