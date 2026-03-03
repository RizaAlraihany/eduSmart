import api from "./api";

/**
 * Factory fungsi untuk membuat service CRUD standar.
 * Semua endpoint mengikuti format apiResource Laravel.
 */
const createService = (endpoint) => ({
  getAll: (params = {}) =>
    api.get(`/${endpoint}`, { params }).then((r) => r.data),

  getById: (id) => api.get(`/${endpoint}/${id}`).then((r) => r.data),

  create: (data) => api.post(`/${endpoint}`, data).then((r) => r.data),

  update: (id, data) => api.put(`/${endpoint}/${id}`, data).then((r) => r.data),

  delete: (id) => api.delete(`/${endpoint}/${id}`).then((r) => r.data),
});

// Services per resource

export const siswaService = {
  ...createService("siswa"),
  /** GET /api/siswa?search=...&kelas_id=...&status=...&per_page=... */
  search: (params) => api.get("/siswa", { params }).then((r) => r.data),
};

export const guruService = {
  ...createService("guru"),
  /** GET /api/guru?search=...&status=... */
  search: (params) => api.get("/guru", { params }).then((r) => r.data),
};

export const kelasService = {
  ...createService("kelas"),
  /** GET /api/kelas?tingkat=...&status=aktif */
  getAktif: () =>
    api
      .get("/kelas", { params: { status: "aktif", per_page: 100 } })
      .then((r) => r.data),
};

export const mapelService = createService("mapel");

export const jadwalService = {
  ...createService("jadwal"),
  /**
   * GET /api/jadwal?hari=Senin&kelas_id=...
   */
  getByHari: (hari, params = {}) =>
    api.get("/jadwal", { params: { hari, ...params } }).then((r) => r.data),
};

export const absensiService = {
  ...createService("absensi"),
  getByTanggal: (tanggal, params = {}) =>
    api.get("/absensi", { params: { tanggal, ...params } }).then((r) => r.data),
};

// --- TAMBAHAN BARU UNTUK DASHBOARD.JSX ---

export const pengumumanService = {
  ...createService("pengumuman"),
  /** * Mengambil data pengumuman terbaru
   * GET /api/pengumuman?limit=5
   */
  getTerbaru: (limit = 5) =>
    api.get("/pengumuman", { params: { limit } }).then((r) => r.data),
};

export const dashboardService = {
  /** * Mengambil data statistik dashboard utama
   * Sesuaikan dengan endpoint statistik Laravel Anda
   * GET /api/dashboard
   */
  getStats: () => api.get("/dashboard").then((r) => r.data),
};
