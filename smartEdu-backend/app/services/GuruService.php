<?php

namespace App\Services;

use App\Models\Guru;
use App\Models\Siswa;
use App\Models\Tugas;

class GuruService
{
    /**
     * Ambil tugas aktif milik guru yang masih ada siswa belum dinilai.
     * Menggantikan Guru::tugasBelumDinilai() — semester-aware, N+1 safe.
     *
     * @return \Illuminate\Support\Collection
     */
    public function tugasPendingGrading(Guru $guru, string $semester, string $tahunAjaran)
    {
        $tugasAktif = Tugas::where('guru_id', $guru->id)
            ->where('status', 'aktif')
            ->where('semester', $semester)
            ->where('tahun_ajaran', $tahunAjaran)
            ->withCount('nilais')
            ->with(['kelas:id,nama_kelas', 'mataPelajaran:id,nama_mapel'])
            ->orderBy('tanggal_deadline')
            ->get(['id', 'kelas_id', 'judul', 'tanggal_deadline']);

        // Batch load jumlah siswa per kelas — hindari N+1
        $kelasIds      = $tugasAktif->pluck('kelas_id')->unique()->all();
        $siswaPerKelas = Siswa::whereIn('kelas_id', $kelasIds)
            ->where('status', 'aktif')
            ->selectRaw('kelas_id, COUNT(*) as total')
            ->groupBy('kelas_id')
            ->pluck('total', 'kelas_id');

        return $tugasAktif
            ->map(function ($tugas) use ($siswaPerKelas) {
                $totalSiswa            = $siswaPerKelas[$tugas->kelas_id] ?? 0;
                $tugas->total_siswa    = $totalSiswa;
                $tugas->sudah_dinilai  = $tugas->nilais_count;
                $tugas->belum_dinilai  = max(0, $totalSiswa - $tugas->nilais_count);
                $tugas->persen_selesai = $totalSiswa > 0
                    ? round(($tugas->nilais_count / $totalSiswa) * 100, 1)
                    : 0;
                return $tugas;
            })
            ->filter(fn($t) => $t->belum_dinilai > 0)
            ->values();
    }
}
