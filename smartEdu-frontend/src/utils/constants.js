// ─── API ─────────────────────────────────────────────────────────────────────
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const SANCTUM_URL =
  import.meta.env.VITE_SANCTUM_URL || "http://localhost:8000";

// ─── Role ─────────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin",
  GURU: "guru",
  SISWA: "siswa",
};

// ─── Status ──────────────────────────────────────────────────────────────────
export const STATUS_SISWA = {
  AKTIF: "aktif",
  NONAKTIF: "nonaktif",
  LULUS: "lulus",
  PINDAH: "pindah",
};

export const STATUS_GURU = {
  AKTIF: "aktif",
  NONAKTIF: "nonaktif",
};

export const STATUS_PEMBAYARAN = {
  LUNAS: "lunas",
  BELUM_BAYAR: "belum_bayar",
  CICILAN: "cicilan",
};

export const STATUS_KEHADIRAN = {
  HADIR: "hadir",
  SAKIT: "sakit",
  IZIN: "izin",
  ALPA: "alpa",
};

export const TIPE_PENGUMUMAN = {
  URGENT: "urgent",
  PENTING: "penting",
  BIASA: "biasa",
};

// ─── Hari ────────────────────────────────────────────────────────────────────
export const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// ─── Tingkat kelas ────────────────────────────────────────────────────────────
export const TINGKAT = ["X", "XI", "XII"];

// ─── Jenis kelamin ────────────────────────────────────────────────────────────
export const JENIS_KELAMIN = {
  L: "Laki-laki",
  P: "Perempuan",
};

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PER_PAGE = 15;

// ─── Local storage keys ───────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  USER_DATA: "user_data",
};
