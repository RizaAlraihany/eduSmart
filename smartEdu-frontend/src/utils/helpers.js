import {
  JENIS_KELAMIN,
  STATUS_SISWA,
  STATUS_PEMBAYARAN,
  STATUS_KEHADIRAN,
  TIPE_PENGUMUMAN,
} from "./constants";

// ─── Format tanggal ke ID ─────────────────────────────────────────────────────
export const formatTanggal = (tanggal, options = {}) => {
  if (!tanggal) return "—";
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
};

// ─── Format tanggal pendek ────────────────────────────────────────────────────
export const formatTanggalPendek = (tanggal) => {
  if (!tanggal) return "—";
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ─── Format jam ───────────────────────────────────────────────────────────────
export const formatJam = (jam) => {
  if (!jam) return "—";
  // Jika format sudah HH:mm, kembalikan langsung
  if (typeof jam === "string" && jam.length <= 5) return jam;
  return new Date(jam).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Format angka ke rupiah ───────────────────────────────────────────────────
export const formatRupiah = (angka) => {
  if (!angka && angka !== 0) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

// ─── Label jenis kelamin ──────────────────────────────────────────────────────
export const labelJenisKelamin = (kode) => JENIS_KELAMIN[kode] ?? kode ?? "—";

// ─── Badge color per status ───────────────────────────────────────────────────
export const statusSiswaBadge = (status) => {
  const map = {
    [STATUS_SISWA.AKTIF]: "success",
    [STATUS_SISWA.NONAKTIF]: "default",
    [STATUS_SISWA.LULUS]: "info",
    [STATUS_SISWA.PINDAH]: "warning",
  };
  return map[status] ?? "default";
};

export const statusPembayaranBadge = (status) => {
  const map = {
    [STATUS_PEMBAYARAN.LUNAS]: "success",
    [STATUS_PEMBAYARAN.BELUM_BAYAR]: "danger",
    [STATUS_PEMBAYARAN.CICILAN]: "warning",
  };
  return map[status] ?? "default";
};

export const statusKehadiranBadge = (status) => {
  const map = {
    [STATUS_KEHADIRAN.HADIR]: "success",
    [STATUS_KEHADIRAN.SAKIT]: "warning",
    [STATUS_KEHADIRAN.IZIN]: "info",
    [STATUS_KEHADIRAN.ALPA]: "danger",
  };
  return map[status] ?? "default";
};

export const tipePengumumanBadge = (tipe) => {
  const map = {
    [TIPE_PENGUMUMAN.URGENT]: "danger",
    [TIPE_PENGUMUMAN.PENTING]: "warning",
    [TIPE_PENGUMUMAN.BIASA]: "info",
  };
  return map[tipe] ?? "default";
};

// ─── Ambil inisial nama untuk avatar ─────────────────────────────────────────
export const getInitials = (name = "") => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
};

// ─── Truncate teks ────────────────────────────────────────────────────────────
export const truncate = (str, length = 50) => {
  if (!str) return "";
  return str.length > length ? str.slice(0, length) + "..." : str;
};

// ─── Hari ini dalam bahasa Melayu (sesuai backend Carbon) ────────────────────
export const getHariIni = () => {
  const map = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return map[new Date().getDay()];
};
