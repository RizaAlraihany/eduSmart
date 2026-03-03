<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\Guru;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\Absensi;
use App\Models\Pembayaran;
use App\Models\Pengumuman;
use App\Models\Nilai;
use App\Models\Tugas;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // ── Data yang tampil untuk SEMUA role ─────────────────────────────────
        $base = [
            'user'                => $user,
            'pengumuman_terbaru'  => Pengumuman::where('status', 'aktif')
                ->where('tanggal_mulai', '<=', now())
                ->where('tanggal_selesai', '>=', now())
                ->latest()
                ->take(5)
                ->get(),
        ];

        // ── Routing per role ──────────────────────────────────────────────────
        $roleData = match (true) {
            $user->isAdmin() => $this->dataAdmin(),
            $user->isGuru()  => $this->dataGuru($user),
            $user->isSiswa() => $this->dataSiswa($user),
            default          => [],
        };

        return response()->json([
            'success' => true,
            'message' => 'Data dashboard berhasil diambil',
            'data'    => array_merge($base, $roleData),
        ], 200);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────────────────────

    private function dataAdmin(): array
    {
        $semesterAktif  = '1';
        $tahunAjaran    = '2024/2025';

        // Statistik absensi 7 hari terakhir
        $absensi7Hari = Absensi::selectRaw('tanggal, status_kehadiran, COUNT(*) as total')
            ->where('tanggal', '>=', now()->subDays(6)->toDateString())
            ->groupBy('tanggal', 'status_kehadiran')
            ->orderBy('tanggal')
            ->get()
            ->groupBy('tanggal');

        // Progres input nilai: berapa siswa aktif sudah punya nilai semester ini
        $totalSiswaAktif   = Siswa::where('status', 'aktif')->count();
        $siswaYangSudahDapat = Nilai::where('semester', $semesterAktif)
            ->where('tahun_ajaran', $tahunAjaran)
            ->distinct('siswa_id')
            ->count('siswa_id');

        // Pembayaran ringkasan
        $pembayaranStats = Pembayaran::selectRaw(
            "status_pembayaran, COUNT(*) as total, SUM(jumlah) as nominal"
        )
            ->groupBy('status_pembayaran')
            ->get()
            ->keyBy('status_pembayaran');

        // Log aktivitas terbaru
        $logAktivitas = ActivityLog::with('user:id,name,role')
            ->latest()
            ->take(10)
            ->get();

        return [
            // ── Kartu statistik utama ──
            'total_siswa'         => $totalSiswaAktif,
            'total_guru'          => Guru::where('status', 'aktif')->count(),
            'total_kelas'         => Kelas::where('status', 'aktif')->count(),
            'total_mapel'         => MataPelajaran::where('status', 'aktif')->count(),

            // ── Pembayaran ──
            'pembayaran_pending'  => $pembayaranStats['belum_bayar']->total   ?? 0,
            'pembayaran_lunas'    => $pembayaranStats['sudah_bayar']->total   ?? 0,
            'pembayaran_terlambat'=> $pembayaranStats['terlambat']->total     ?? 0,
            'nominal_pending'     => $pembayaranStats['belum_bayar']->nominal ?? 0,

            // ── Absensi ──
            'absensi_hari_ini'    => Absensi::whereDate('tanggal', today())->count(),
            'absensi_hadir_hari_ini' => Absensi::whereDate('tanggal', today())
                                            ->where('status_kehadiran', 'hadir')
                                            ->count(),
            'grafik_absensi_7hari'=> $absensi7Hari,

            // ── Nilai & Tugas ──
            'progres_input_nilai' => [
                'sudah'   => $siswaYangSudahDapat,
                'total'   => $totalSiswaAktif,
                'persen'  => $totalSiswaAktif > 0
                    ? round(($siswaYangSudahDapat / $totalSiswaAktif) * 100, 1)
                    : 0,
            ],

            // ── Log aktivitas ──
            'log_aktivitas'       => $logAktivitas,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GURU
    // ─────────────────────────────────────────────────────────────────────────

    private function dataGuru($user): array
    {
        $guru = $user->guru;

        if (! $guru) {
            return ['error' => 'Profil guru tidak ditemukan.'];
        }

        $semesterAktif = '1';
        $tahunAjaran   = '2024/2025';
        $hariIni       = Carbon::now()->locale('id')->translatedFormat('l'); // 'Senin', dll

        // Jadwal hari ini
        $jadwalHariIni = $guru->jadwals()
            ->where('hari', $hariIni)
            ->where('status', 'aktif')
            ->where('semester', $semesterAktif)
            ->where('tahun_ajaran', $tahunAjaran)
            ->with(['kelas', 'mataPelajaran'])
            ->orderBy('jam_mulai')
            ->get();

        // Kelas yang diajar (distinct)
        $kelasDiajar = Kelas::whereHas('jadwals', fn($q) =>
            $q->where('guru_id', $guru->id)
              ->where('semester', $semesterAktif)
              ->where('tahun_ajaran', $tahunAjaran)
              ->where('status', 'aktif')
        )->with('siswas:id,kelas_id,nama')->get();

        // Tugas belum dinilai
        $tugasBelumDinilai = $guru->tugasBelumDinilai();

        // Statistik absensi yang dicatat guru ini bulan ini
        $absensiStats = $guru->absensis()
            ->whereMonth('tanggal', now()->month)
            ->whereYear('tanggal', now()->year)
            ->selectRaw('status_kehadiran, COUNT(*) as total')
            ->groupBy('status_kehadiran')
            ->get()
            ->keyBy('status_kehadiran');

        // Total siswa yang sudah di-input nilai oleh guru ini semester ini
        $totalNilaiDiinput = $guru->nilais()
            ->where('semester', $semesterAktif)
            ->where('tahun_ajaran', $tahunAjaran)
            ->count();

        return [
            'jadwal_hari_ini'       => $jadwalHariIni,
            'total_jadwal_hari_ini' => $jadwalHariIni->count(),
            'kelas_diampu'          => $kelasDiajar->count(),
            'detail_kelas_diampu'   => $kelasDiajar,
            'tugas_belum_dinilai'   => $tugasBelumDinilai,
            'total_tugas_aktif'     => $guru->tugass()->where('status', 'aktif')->count(),
            'absensi_bulan_ini'     => [
                'hadir' => $absensiStats['hadir']->total ?? 0,
                'sakit' => $absensiStats['sakit']->total ?? 0,
                'izin'  => $absensiStats['izin']->total  ?? 0,
                'alpa'  => $absensiStats['alpa']->total  ?? 0,
            ],
            'total_nilai_diinput'   => $totalNilaiDiinput,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SISWA
    // ─────────────────────────────────────────────────────────────────────────

    private function dataSiswa($user): array
    {
        $siswa = $user->siswa;

        if (! $siswa) {
            return ['error' => 'Profil siswa tidak ditemukan.'];
        }

        $semesterAktif = '1';
        $tahunAjaran   = '2024/2025';
        $hariIni       = Carbon::now()->locale('id')->translatedFormat('l');

        // Jadwal hari ini (via kelas siswa)
        $jadwalHariIni = [];
        if ($siswa->kelas_id) {
            $jadwalHariIni = $siswa->kelas->jadwals()
                ->where('hari', $hariIni)
                ->where('status', 'aktif')
                ->where('semester', $semesterAktif)
                ->where('tahun_ajaran', $tahunAjaran)
                ->with(['mataPelajaran', 'guru'])
                ->orderBy('jam_mulai')
                ->get();
        }

        // Nilai terbaru (5 terakhir) dengan mapel
        $nilaiTerbaru = $siswa->nilais()
            ->where('semester', $semesterAktif)
            ->where('tahun_ajaran', $tahunAjaran)
            ->with(['mataPelajaran'])
            ->latest()
            ->take(5)
            ->get();

        // Rekap nilai per mapel + per jenis (tugas/pts/uts/uas)
        $rekapNilai = $siswa->nilais()
            ->where('semester', $semesterAktif)
            ->where('tahun_ajaran', $tahunAjaran)
            ->with(['mataPelajaran:id,nama_mapel,kkm'])
            ->get()
            ->groupBy('mata_pelajaran_id')
            ->map(fn($items) => [
                'mapel'      => $items->first()->mataPelajaran?->nama_mapel,
                'kkm'        => $items->first()->mataPelajaran?->kkm,
                'rata_rata'  => round($items->avg('nilai'), 2),
                'per_jenis'  => $items->groupBy('jenis_nilai')
                                      ->map(fn($v) => round($v->avg('nilai'), 2)),
            ])
            ->values();

        // Tugas terdekat
        $tugasTerdekat = $siswa->tugasAktif()->take(3);

        // Sisa tagihan
        $sisaTagihan = $siswa->pembayarans()
            ->where('status_pembayaran', 'belum_bayar')
            ->sum('jumlah');

        $pembayaranPending = $siswa->pembayarans()
            ->where('status_pembayaran', 'belum_bayar')
            ->count();

        // Persentase kehadiran bulan ini
        $persenHadir = $siswa->persenHadirBulanIni();

        // Nilai rata-rata semester ini
        $rataNilai = $siswa->rataNilaiSemesterIni($semesterAktif, $tahunAjaran);

        return [
            'siswa'              => $siswa->load('kelas:id,nama_kelas,tingkat'),
            'jadwal_hari_ini'    => $jadwalHariIni,
            'nilai_terbaru'      => $nilaiTerbaru,
            'rekap_nilai'        => $rekapNilai,
            'tugas_terdekat'     => $tugasTerdekat,
            'persen_hadir'       => $persenHadir,
            'rata_nilai'         => $rataNilai,
            'sisa_tagihan'       => $sisaTagihan,
            'pembayaran_pending' => $pembayaranPending,
        ];
    }
}
