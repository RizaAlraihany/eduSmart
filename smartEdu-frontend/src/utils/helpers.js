/**
 * src/utils/helpers.js
 */
export const formatTanggal = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const labelJenisKelamin = (jk) => {
  if (jk === "L") return "Laki-laki";
  if (jk === "P") return "Perempuan";
  return jk ?? "—";
};

export const statusSiswaBadge = (status) => {
  const map = {
    aktif: "success",
    nonaktif: "danger",
    lulus: "info",
    pindah: "warning",
  };
  return map[status] ?? "default";
};

export const rupiah = (n) =>
  n != null
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(n)
    : "Rp 0";

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
};
