/**
 * src/services/dataService.js
 *
 * Barrel file — re-export semua service dari masing-masing feature.
 * File ini hanya penghubung agar import di page tidak perlu berubah.
 *
 * Jangan tambahkan logic di sini.
 * Logic ada di masing-masing:
 *   src/features/mata-pelajaran/services/mapelService.js
 *   src/features/jadwal/services/jadwalService.js
 *   src/features/nilai/services/nilaiService.js
 *   src/features/pembayaran/services/pembayaranService.js
 *   src/features/pengumuman/services/pengumumanService.js
 */

export { default as mapelService }      from "@/features/mata-pelajaran/services/mapelService";
export { default as jadwalService }     from "@/features/jadwal/services/jadwalService";
export { default as nilaiService }      from "@/features/nilai/services/nilaiService";
export { default as pembayaranService } from "@/features/pembayaran/services/pembayaranService";
export { default as pengumumanService } from "@/features/pengumuman/services/pengumumanService";
