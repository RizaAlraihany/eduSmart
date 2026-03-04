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

// ─── Resource Services ────────────────────────────────────────────────────────

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
  /** GET /api/kelas?status=aktif&per_page=100 */
  getAktif: () =>
    api
      .get("/kelas", { params: { status: "aktif", per_page: 100 } })
      .then((r) => r.data),
};

export const mapelService = createService("mapel");

export const jadwalService = {
  ...createService("jadwal"),
  /** GET /api/jadwal?hari=Senin&kelas_id=... */
  getByHari: (hari, params = {}) =>
    api.get("/jadwal", { params: { hari, ...params } }).then((r) => r.data),
};

export const absensiService = {
  ...createService("absensi"),
  getByTanggal: (tanggal, params = {}) =>
    api.get("/absensi", { params: { tanggal, ...params } }).then((r) => r.data),
};

export const nilaiService = {
  ...createService("nilai"),
  /** GET /api/nilai?siswa_id=...&semester=...&tahun_ajaran=... */
  getBySiswa: (siswaId, params = {}) =>
    api
      .get("/nilai", { params: { siswa_id: siswaId, ...params } })
      .then((r) => r.data),
};

export const tugasService = {
  ...createService("tugas"),
  /** GET /api/tugas?status=aktif&kelas_id=... */
  getAktif: (params = {}) =>
    api
      .get("/tugas", { params: { status: "aktif", ...params } })
      .then((r) => r.data),
};

export const pembayaranService = {
  ...createService("pembayaran"),
  /** GET /api/pembayaran?status_pembayaran=belum_bayar&siswa_id=... */
  getPending: (params = {}) =>
    api
      .get("/pembayaran", {
        params: { status_pembayaran: "belum_bayar", ...params },
      })
      .then((r) => r.data),
};

export const pengumumanService = {
  ...createService("pengumuman"),
  /** GET /api/pengumuman?limit=5 */
  getTerbaru: (limit = 5) =>
    api.get("/pengumuman", { params: { limit } }).then((r) => r.data),
};

// ─── Dashboard Services ───────────────────────────────────────────────────────
//
// Tiga endpoint dedicated per role (sinkron DashboardController.php):
//   GET /api/dashboard/siswa  → DashboardController::siswa()
//   GET /api/dashboard/guru   → DashboardController::guru()
//   GET /api/dashboard/admin  → DashboardController::admin()
//
// Response shape: { success: true, message: string, data: { ... } }
// Caller harus drill ke res.data untuk payload dashboard.
// ─────────────────────────────────────────────────────────────────────────────

export const dashboardService = {
  /**
   * GET /api/dashboard
   * Endpoint lama — backward-compatible.
   * Masih dipakai jika perlu fallback ke single endpoint.
   */
  getStats: () => api.get("/dashboard").then((r) => r.data),

  /**
   * GET /api/dashboard/siswa
   * Response.data fields:
   *   nama, kelas, tingkat,
   *   rata_nilai_tugas, persen_kehadiran,
   *   sisa_tagihan, detail_tagihan,
   *   jadwal_hari_ini[], tugas_belum_dikerjakan[],
   *   tugas_menunggu_nilai[], rekap_pts[], rekap_pas[],
   *   pengumuman[]
   */
  getSiswa: () => api.get("/dashboard/DashboardSiswa").then((r) => r.data),

  /**
   * GET /api/dashboard/guru
   * Response.data fields:
   *   nama, nip,
   *   jumlah_kelas_hari_ini, total_kelas_semester_ini,
   *   jumlah_tugas_perlu_dinilai,
   *   jadwal_hari_ini[] (+ absensi_filled flag),
   *   kelas_belum_absen[], ada_kelas_belum_absen,
   *   tugas_pending_grading[] (+ persen_selesai, total_siswa, sudah_dinilai, belum_dinilai),
   *   pengumuman[]
   */
  getGuru: () => api.get("/dashboard/DashboardGuru").then((r) => r.data),

  /**
   * GET /api/dashboard/admin
   * Response.data fields:
   *   total_siswa_aktif, total_guru_aktif, total_staf_aktif,
   *   kehadiran_hari_ini { hadir, sakit, izin, alpa, total, persen_hadir },
   *   progres_input_nilai[] { guru_id, nama, sudah_dinilai, total_tugas, belum_dinilai, persen_selesai },
   *   pemasukan_spp_bulan_ini,
   *   jumlah_siswa_menunggak,
   *   log_aktivitas[]
   */
  getAdmin: () => api.get("/dashboard/DashboardAdmin").then((r) => r.data),
};
