import api from "./api";

const dataService = {
  // Dashboard
  async getDashboard() {
    return await api.get("/dashboard");
  },

  // Siswa
  async getSiswas(params = {}) {
    return await api.get("/siswa", { params });
  },

  async getSiswa(id) {
    return await api.get(`/siswa/${id}`);
  },

  async createSiswa(data) {
    return await api.post("/siswa", data);
  },

  async updateSiswa(id, data) {
    return await api.put(`/siswa/${id}`, data);
  },

  async deleteSiswa(id) {
    return await api.delete(`/siswa/${id}`);
  },

  // Guru
  async getGurus(params = {}) {
    return await api.get("/guru", { params });
  },

  async getGuru(id) {
    return await api.get(`/guru/${id}`);
  },

  async createGuru(data) {
    return await api.post("/guru", data);
  },

  async updateGuru(id, data) {
    return await api.put(`/guru/${id}`, data);
  },

  async deleteGuru(id) {
    return await api.delete(`/guru/${id}`);
  },

  // Kelas
  async getKelas(params = {}) {
    return await api.get("/kelas", { params });
  },

  async getKelasById(id) {
    return await api.get(`/kelas/${id}`);
  },

  async createKelas(data) {
    return await api.post("/kelas", data);
  },

  async updateKelas(id, data) {
    return await api.put(`/kelas/${id}`, data);
  },

  async deleteKelas(id) {
    return await api.delete(`/kelas/${id}`);
  },

  // Mata Pelajaran
  async getMapel(params = {}) {
    return await api.get("/mata-pelajaran", { params });
  },

  async getMapelById(id) {
    return await api.get(`/mata-pelajaran/${id}`);
  },

  async createMapel(data) {
    return await api.post("/mata-pelajaran", data);
  },

  async updateMapel(id, data) {
    return await api.put(`/mata-pelajaran/${id}`, data);
  },

  async deleteMapel(id) {
    return await api.delete(`/mata-pelajaran/${id}`);
  },

  // Jadwal
  async getJadwal(params = {}) {
    return await api.get("/jadwal", { params });
  },

  async getJadwalById(id) {
    return await api.get(`/jadwal/${id}`);
  },

  async createJadwal(data) {
    return await api.post("/jadwal", data);
  },

  async updateJadwal(id, data) {
    return await api.put(`/jadwal/${id}`, data);
  },

  async deleteJadwal(id) {
    return await api.delete(`/jadwal/${id}`);
  },

  // Absensi
  async getAbsensi(params = {}) {
    return await api.get("/absensi", { params });
  },

  async createAbsensi(data) {
    return await api.post("/absensi", data);
  },

  async updateAbsensi(id, data) {
    return await api.put(`/absensi/${id}`, data);
  },

  // Nilai
  async getNilai(params = {}) {
    return await api.get("/nilai", { params });
  },

  async createNilai(data) {
    return await api.post("/nilai", data);
  },

  async updateNilai(id, data) {
    return await api.put(`/nilai/${id}`, data);
  },

  async deleteNilai(id) {
    return await api.delete(`/nilai/${id}`);
  },

  // Pembayaran
  async getPembayaran(params = {}) {
    return await api.get("/pembayaran", { params });
  },

  async getPembayaranById(id) {
    return await api.get(`/pembayaran/${id}`);
  },

  async createPembayaran(data) {
    return await api.post("/pembayaran", data);
  },

  async updatePembayaran(id, data) {
    return await api.put(`/pembayaran/${id}`, data);
  },

  async deletePembayaran(id) {
    return await api.delete(`/pembayaran/${id}`);
  },

  // Pengumuman
  async getPengumuman(params = {}) {
    return await api.get("/pengumuman", { params });
  },

  async getPengumumanById(id) {
    return await api.get(`/pengumuman/${id}`);
  },

  async createPengumuman(data) {
    return await api.post("/pengumuman", data);
  },

  async updatePengumuman(id, data) {
    return await api.put(`/pengumuman/${id}`, data);
  },

  async deletePengumuman(id) {
    return await api.delete(`/pengumuman/${id}`);
  },
};

export default dataService;
