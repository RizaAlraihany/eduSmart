import api from "./api";

const dataService = {
  // Dashboard
  async getDashboard() {
    return await api.get("/api/dashboard");
  },

  // Siswa
  async getSiswas(params = {}) {
    return await api.get("/api/siswa", { params });
  },

  async getSiswa(id) {
    return await api.get(`/api/siswa/${id}`);
  },

  async createSiswa(data) {
    return await api.post("/api/siswa", data);
  },

  async updateSiswa(id, data) {
    return await api.put(`/api/siswa/${id}`, data);
  },

  async deleteSiswa(id) {
    return await api.delete(`/api/siswa/${id}`);
  },

  // Guru
  async getGurus(params = {}) {
    return await api.get("/api/guru", { params });
  },

  async getGuru(id) {
    return await api.get(`/api/guru/${id}`);
  },

  async createGuru(data) {
    return await api.post("/api/guru", data);
  },

  async updateGuru(id, data) {
    return await api.put(`/api/guru/${id}`, data);
  },

  async deleteGuru(id) {
    return await api.delete(`/api/guru/${id}`);
  },

  // Kelas
  async getKelas(params = {}) {
    return await api.get("/api/kelas", { params });
  },

  async getKelasById(id) {
    return await api.get(`/api/kelas/${id}`);
  },

  async createKelas(data) {
    return await api.post("/api/kelas", data);
  },

  async updateKelas(id, data) {
    return await api.put(`/api/kelas/${id}`, data);
  },

  async deleteKelas(id) {
    return await api.delete(`/api/kelas/${id}`);
  },

  // Mata Pelajaran
  async getMapel(params = {}) {
    return await api.get("/api/mata-pelajaran", { params });
  },

  async getMapelById(id) {
    return await api.get(`/api/mata-pelajaran/${id}`);
  },

  async createMapel(data) {
    return await api.post("/api/mata-pelajaran", data);
  },

  async updateMapel(id, data) {
    return await api.put(`/api/mata-pelajaran/${id}`, data);
  },

  async deleteMapel(id) {
    return await api.delete(`/api/mata-pelajaran/${id}`);
  },

  // Jadwal
  async getJadwal(params = {}) {
    return await api.get("/api/jadwal", { params });
  },

  async getJadwalById(id) {
    return await api.get(`/api/jadwal/${id}`);
  },

  async createJadwal(data) {
    return await api.post("/api/jadwal", data);
  },

  async updateJadwal(id, data) {
    return await api.put(`/api/jadwal/${id}`, data);
  },

  async deleteJadwal(id) {
    return await api.delete(`/api/jadwal/${id}`);
  },

  // Absensi
  async getAbsensi(params = {}) {
    return await api.get("/api/absensi", { params });
  },

  async createAbsensi(data) {
    return await api.post("/api/absensi", data);
  },

  async updateAbsensi(id, data) {
    return await api.put(`/api/absensi/${id}`, data);
  },

  // Nilai
  async getNilai(params = {}) {
    return await api.get("/api/nilai", { params });
  },

  async createNilai(data) {
    return await api.post("/api/nilai", data);
  },

  async updateNilai(id, data) {
    return await api.put(`/api/nilai/${id}`, data);
  },

  async deleteNilai(id) {
    return await api.delete(`/api/nilai/${id}`);
  },

  // Pembayaran
  async getPembayaran(params = {}) {
    return await api.get("/api/pembayaran", { params });
  },

  async getPembayaranById(id) {
    return await api.get(`/api/pembayaran/${id}`);
  },

  async createPembayaran(data) {
    return await api.post("/api/pembayaran", data);
  },

  async updatePembayaran(id, data) {
    return await api.put(`/api/pembayaran/${id}`, data);
  },

  async deletePembayaran(id) {
    return await api.delete(`/api/pembayaran/${id}`);
  },

  // Pengumuman
  async getPengumuman(params = {}) {
    return await api.get("/api/pengumuman", { params });
  },

  async getPengumumanById(id) {
    return await api.get(`/api/pengumuman/${id}`);
  },

  async createPengumuman(data) {
    return await api.post("/api/pengumuman", data);
  },

  async updatePengumuman(id, data) {
    return await api.put(`/api/pengumuman/${id}`, data);
  },

  async deletePengumuman(id) {
    return await api.delete(`/api/pengumuman/${id}`);
  },
};

export default dataService;
