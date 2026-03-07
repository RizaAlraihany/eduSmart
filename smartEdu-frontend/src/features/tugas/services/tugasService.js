import api from "@/lib/api";

const tugasService = {
  getAll: (params = {}) => api.get("/tugas", { params }).then((r) => r.data),
  getById: (id) => api.get(`/tugas/${id}`).then((r) => r.data),
  create: (payload) => api.post("/tugas", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/tugas/${id}`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/tugas/${id}`).then((r) => r.data),
  getBySiswa: (params = {}) =>
    api.get("/tugas/siswa", { params }).then((r) => r.data),
};

export default tugasService;
