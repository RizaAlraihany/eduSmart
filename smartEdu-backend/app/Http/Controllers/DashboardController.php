<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\Guru;
use App\Models\User;
use App\Models\Absensi;
use App\Models\Pembayaran;
use App\Models\Pengumuman;
use App\Models\Nilai;
use App\Models\Tugas;
use App\Models\ActivityLog;
use App\Services\GuruService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    private string $semester    = '1';
    private string $tahunAjaran = '2024/2025';

    private const HARI_MAP = [
        'Monday'    => 'Senin',
        'Tuesday'   => 'Selasa',
        'Wednesday' => 'Rabu',
        'Thursday'  => 'Kamis',
        'Friday'    => 'Jumat',
        'Saturday'  => 'Sabtu',
        'Sunday'    => 'Minggu',
    ];

    public function __construct(private GuruService $guruService) {}

    // GET /api/dashboard  — legacy endpoint, masih dikonsumsi Dashboard.jsx lama

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $base = [
            'user'               => $user,
            'pengumuman_terbaru' => $this->getPengumuman(),
        ];

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
        ]);
    }

    // GET /api/dashboard/siswa

    public function siswa(Request $request): JsonResponse
    {
        $user  = $request->user();
        $siswa = Siswa::with(['kelas:id,nama_kelas,tingkat'])
            ->where('user_id', $user->id)
            ->first();

        if (! $siswa) {
            return response()->json([
                'success' => false,
                'message' => 'Profil siswa tidak ditemukan.',
            ], 404);
        }

        $hariIni = self::HARI_MAP[now()->format('l')];

        // Jadwal hari ini 
        $jadwalHariIni = collect();
        if ($siswa->kelas_id) {
            $jadwalHariIni = $siswa->kelas->jadwals()
                ->where('hari', $hariIni)
                ->where('status', 'aktif')
                ->where('semester', $this->semester)
                ->where('tahun_ajaran', $this->tahunAjaran)
                ->with([
                    'mataPelajaran:id,nama_mapel,kode_mapel',
                    'guru:id,nama',
                ])
                ->orderBy('jam_mulai')
                ->get(['id', 'kelas_id', 'mata_pelajaran_id', 'guru_id', 'hari', 'jam_mulai', 'jam_selesai', 'ruangan']);
        }

        // Tugas aktif kelas siswa 
        $semuaTugasAktif = Tugas::where('kelas_id', $siswa->kelas_id)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with(['mataPelajaran:id,nama_mapel', 'guru:id,nama'])
            ->orderBy('tanggal_deadline')
            ->get();

        $nilaiTugasIds = Nilai::where('siswa_id', $siswa->id)
            ->whereNotNull('tugas_id')
            ->pluck('tugas_id')
            ->all();

        $tugasBelumDikerjakan = $semuaTugasAktif
            ->filter(fn($t) => $t->tanggal_deadline >= today() && ! in_array($t->id, $nilaiTugasIds))
            ->values();

        $tugasMenungguNilai = $semuaTugasAktif
            ->filter(fn($t) => $t->tanggal_deadline < today() && ! in_array($t->id, $nilaiTugasIds))
            ->values();

        // Nilai semester ini (satu query) 
        $semuaNilai = Nilai::where('siswa_id', $siswa->id)
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with('mataPelajaran:id,nama_mapel,kkm')
            ->get();

        $rataNilaiTugas = round(
            $semuaNilai->whereIn('jenis_nilai', ['tugas', 'harian'])->avg('nilai') ?? 0,
            2
        );

        $rekapNilai = $semuaNilai
            ->groupBy('mata_pelajaran_id')
            ->map(fn($items) => [
                'mapel'     => $items->first()->mataPelajaran?->nama_mapel,
                'kkm'       => $items->first()->mataPelajaran?->kkm,
                'rata_rata' => round($items->avg('nilai'), 2),
                'per_jenis' => $items->groupBy('jenis_nilai')
                    ->map(fn($v) => round($v->avg('nilai'), 2)),
            ])
            ->values();

        $rekapPTS = $semuaNilai->where('jenis_nilai', 'uts')
            ->groupBy('mata_pelajaran_id')
            ->map(fn($items) => [
                'mapel' => $items->first()->mataPelajaran?->nama_mapel,
                'nilai' => round($items->avg('nilai'), 2),
            ])->values();

        $rekapPAS = $semuaNilai->where('jenis_nilai', 'uas')
            ->groupBy('mata_pelajaran_id')
            ->map(fn($items) => [
                'mapel' => $items->first()->mataPelajaran?->nama_mapel,
                'nilai' => round($items->avg('nilai'), 2),
            ])->values();

        // Kehadiran bulan ini 
        $absensiStats = Absensi::where('siswa_id', $siswa->id)
            ->whereYear('tanggal', now()->year)
            ->whereMonth('tanggal', now()->month)
            ->selectRaw('status_kehadiran, COUNT(*) as total')
            ->groupBy('status_kehadiran')
            ->get()
            ->keyBy('status_kehadiran');

        $totalAbsensi    = $absensiStats->sum('total');
        $hadir           = $absensiStats->get('hadir')?->total ?? 0;
        $persenKehadiran = $totalAbsensi > 0
            ? round(($hadir / $totalAbsensi) * 100, 1)
            : 0;

        // Tagihan belum bayar 
        $tagihanBelumBayar = Pembayaran::where('siswa_id', $siswa->id)
            ->where('status_pembayaran', 'belum_bayar')
            ->get(['id', 'jenis_pembayaran', 'jumlah', 'tanggal_jatuh_tempo', 'keterangan']);

        return response()->json([
            'success' => true,
            'message' => 'Dashboard siswa berhasil diambil',
            'data'    => [
                'nama'                   => $siswa->nama,
                'kelas'                  => $siswa->kelas?->nama_kelas,
                'tingkat'                => $siswa->kelas?->tingkat,
                'rata_nilai_tugas'       => $rataNilaiTugas,
                'rekap_nilai'            => $rekapNilai,
                'rekap_pts'              => $rekapPTS,
                'rekap_pas'              => $rekapPAS,
                'persen_kehadiran'       => $persenKehadiran,
                'total_hadir'            => $hadir,
                'total_pertemuan'        => $totalAbsensi,
                'sisa_tagihan'           => (float) $tagihanBelumBayar->sum('jumlah'),
                'detail_tagihan'         => $tagihanBelumBayar,
                'jadwal_hari_ini'        => $jadwalHariIni,
                'tugas_belum_dikerjakan' => $tugasBelumDikerjakan,
                'tugas_menunggu_nilai'   => $tugasMenungguNilai,
                'pengumuman'             => $this->getPengumuman('siswa'),
            ],
        ]);
    }

    
    // GET /api/dashboard/guru

    public function guru(Request $request): JsonResponse
    {
        $user = $request->user();
        $guru = Guru::where('user_id', $user->id)->first();

        if (! $guru) {
            return response()->json([
                'success' => false,
                'message' => 'Profil guru tidak ditemukan.',
            ], 404);
        }

        $hariIni = self::HARI_MAP[now()->format('l')];

        // Jadwal hari ini 
        $jadwalHariIni = $guru->jadwals()
            ->where('hari', $hariIni)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with(['kelas:id,nama_kelas', 'mataPelajaran:id,nama_mapel'])
            ->orderBy('jam_mulai')
            ->get(['id', 'kelas_id', 'mata_pelajaran_id', 'hari', 'jam_mulai', 'jam_selesai', 'ruangan']);

        // Fix N+1: batch check absensi 
        $jadwalIds  = $jadwalHariIni->pluck('id')->all();
        $sudahAbsen = Absensi::whereIn('jadwal_id', $jadwalIds)
            ->whereDate('tanggal', today())
            ->pluck('jadwal_id')
            ->all();

        $jadwalHariIni = $jadwalHariIni->map(function ($jadwal) use ($sudahAbsen) {
            $jadwal->absensi_filled = in_array($jadwal->id, $sudahAbsen);
            return $jadwal;
        });

        $kelasBelumAbsen = $jadwalHariIni->where('absensi_filled', false)->values();

        // Tugas pending grading — delegasi ke GuruService 
        $tugasPendingGrading = $this->guruService->tugasPendingGrading(
            $guru,
            $this->semester,
            $this->tahunAjaran
        );

        // Statistik 
        $jumlahKelasDiajarHariIni = $jadwalHariIni->unique('kelas_id')->count();

        $totalKelasAktif = $guru->jadwals()
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->where('status', 'aktif')
            ->distinct('kelas_id')
            ->count('kelas_id');

        $totalSiswaPerluDinilai = $tugasPendingGrading->sum('belum_dinilai');
        $totalTugasAktif        = $tugasPendingGrading->count();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard guru berhasil diambil',
            'data'    => [
                'nama'                       => $guru->nama,
                'nip'                        => $guru->nip,
                'jumlah_kelas_hari_ini'      => $jumlahKelasDiajarHariIni,
                'total_kelas_semester_ini'   => $totalKelasAktif,
                'jumlah_tugas_perlu_dinilai' => $totalSiswaPerluDinilai,
                'total_tugas_aktif'          => $totalTugasAktif,
                'jadwal_hari_ini'            => $jadwalHariIni,
                'kelas_belum_absen'          => $kelasBelumAbsen,
                'ada_kelas_belum_absen'      => $kelasBelumAbsen->isNotEmpty(),
                'tugas_pending_grading'      => $tugasPendingGrading,
                'pengumuman'                 => $this->getPengumuman('guru'),
            ],
        ]);
    }


    // GET /api/dashboard/admin

    public function admin(Request $request): JsonResponse
    {
        $today    = today()->toDateString();
        $bulanIni = now()->month;
        $tahunIni = now()->year;

        $totalSiswaAktif = Siswa::where('status', 'aktif')->count();
        $totalGuruAktif  = Guru::where('status', 'aktif')->count();
        $totalStafAktif  = User::where('role', 'admin')->count();

        // Kehadiran hari ini 
        $absensiHariIni = Absensi::whereDate('tanggal', $today)
            ->selectRaw('status_kehadiran, COUNT(*) as total')
            ->groupBy('status_kehadiran')
            ->get()
            ->keyBy('status_kehadiran');

        $totalAbsenHariIni  = $absensiHariIni->sum('total');
        $hadirHariIni       = $absensiHariIni->get('hadir')?->total ?? 0;
        $persenHadirHariIni = $totalAbsenHariIni > 0
            ? round(($hadirHariIni / $totalAbsenHariIni) * 100, 1)
            : 0;

        // Progres input nilai per guru 
        $progresNilaiGuru = Guru::where('status', 'aktif')
            ->with([
                'tugass' => fn($q) => $q
                    ->where('status', 'aktif')
                    ->where('semester', $this->semester)
                    ->where('tahun_ajaran', $this->tahunAjaran)
                    ->withCount('nilais'),
            ])
            ->get(['id', 'nama'])
            ->map(function ($guru) {
                $totalTugas   = $guru->tugass->count();
                $tugasSelesai = $guru->tugass->filter(fn($t) => $t->nilais_count > 0)->count();

                return [
                    'guru_id'        => $guru->id,
                    'nama'           => $guru->nama,
                    'total_tugas'    => $totalTugas,
                    'sudah_dinilai'  => $tugasSelesai,
                    'belum_dinilai'  => max(0, $totalTugas - $tugasSelesai),
                    'persen_selesai' => $totalTugas > 0
                        ? round(($tugasSelesai / $totalTugas) * 100, 1)
                        : 0,
                ];
            });

        // Nilai & SPP ───────────────────────────────────────────────────────
        $siswaYangSudahDapat = Nilai::where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->distinct('siswa_id')
            ->count('siswa_id');

        $totalNilaiDiinput = Nilai::where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->count();

        $pemasukanSPP = Pembayaran::where('jenis_pembayaran', 'spp')
            ->where('status_pembayaran', 'lunas')
            ->whereMonth('tanggal_pembayaran', $bulanIni)
            ->whereYear('tanggal_pembayaran', $tahunIni)
            ->sum('jumlah');

        $siswaMenunggak = Pembayaran::where('jenis_pembayaran', 'spp')
            ->where('status_pembayaran', 'belum_bayar')
            ->where('tanggal_jatuh_tempo', '<', today())
            ->distinct('siswa_id')
            ->count('siswa_id');

        // Activity Log 
        $logAktivitas = ActivityLog::with('user:id,name,role')
            ->latest()
            ->take(10)
            ->get(['id', 'user_id', 'action', 'model_type', 'model_id', 'description', 'ip_address', 'created_at']);

        return response()->json([
            'success' => true,
            'message' => 'Dashboard admin berhasil diambil',
            'data'    => [
                'total_siswa_aktif'       => $totalSiswaAktif,
                'total_guru_aktif'        => $totalGuruAktif,
                'total_staf_aktif'        => $totalStafAktif,
                'kehadiran_hari_ini'      => [
                    'hadir'        => $hadirHariIni,
                    'sakit'        => $absensiHariIni->get('sakit')?->total ?? 0,
                    'izin'         => $absensiHariIni->get('izin')?->total  ?? 0,
                    'alpa'         => $absensiHariIni->get('alpa')?->total  ?? 0,
                    'total'        => $totalAbsenHariIni,
                    'persen_hadir' => $persenHadirHariIni,
                ],
                'progres_input_nilai'     => $progresNilaiGuru,
                'pemasukan_spp_bulan_ini' => (float) $pemasukanSPP,
                'jumlah_siswa_menunggak'  => $siswaMenunggak,
                'total_nilai_diinput'     => $totalNilaiDiinput,
                'log_aktivitas'           => $logAktivitas,
            ],
        ]);
    }


    // PRIVATE HELPERS

    private function getPengumuman(?string $targetAudience = null): \Illuminate\Support\Collection
    {
        $query = Pengumuman::where('status', 'aktif')
            ->where('tanggal_mulai', '<=', now())
            ->where('tanggal_selesai', '>=', now())
            ->latest()
            ->take(5);

        if ($targetAudience) {
            $query->where(function ($q) use ($targetAudience) {
                $q->where('target_audience', $targetAudience)
                    ->orWhere('target_audience', 'semua');
            });
        }

        return $query->get(['id', 'judul', 'isi', 'tipe', 'target_audience', 'tanggal_mulai', 'tanggal_selesai', 'created_at']);
    }

    // index() helpers — legacy, dipanggil oleh endpoint /api/dashboard lama 

    private function dataAdmin(): array
    {
        $hariIni  = today()->toDateString();
        $bulanIni = now()->month;
        $tahunIni = now()->year;

        $absensiHariIni = Absensi::whereDate('tanggal', $hariIni)
            ->selectRaw('status_kehadiran, COUNT(*) as total')
            ->groupBy('status_kehadiran')
            ->get()
            ->keyBy('status_kehadiran');

        $totalSiswaAktif     = Siswa::where('status', 'aktif')->count();
        $siswaYangSudahDapat = Nilai::where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->distinct('siswa_id')
            ->count('siswa_id');

        $totalNilaiDiinput = Nilai::where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->count();

        $pemasukanSPP = Pembayaran::where('jenis_pembayaran', 'spp')
            ->where('status_pembayaran', 'lunas')
            ->whereMonth('tanggal_pembayaran', $bulanIni)
            ->whereYear('tanggal_pembayaran', $tahunIni)
            ->sum('jumlah');

        $siswaMenunggak = Pembayaran::where('jenis_pembayaran', 'spp')
            ->where('status_pembayaran', 'belum_bayar')
            ->where('tanggal_jatuh_tempo', '<', today())
            ->distinct('siswa_id')
            ->count('siswa_id');

        $logAktivitas = ActivityLog::with('user:id,name,role')
            ->latest()
            ->take(10)
            ->get(['id', 'user_id', 'action', 'model_type', 'model_id', 'description', 'ip_address', 'created_at']);

        return [
            'total_siswa'         => $totalSiswaAktif,
            'total_guru'          => Guru::where('status', 'aktif')->count(),
            'total_staf'          => User::where('role', 'admin')->count(),
            'absensi_hari_ini'    => [
                'hadir' => $absensiHariIni->get('hadir')?->total ?? 0,
                'sakit' => $absensiHariIni->get('sakit')?->total ?? 0,
                'izin'  => $absensiHariIni->get('izin')?->total  ?? 0,
                'alpa'  => $absensiHariIni->get('alpa')?->total  ?? 0,
            ],
            'progres_input_nilai' => [
                'total_siswa'       => $totalSiswaAktif,
                'sudah_dapat_nilai' => $siswaYangSudahDapat,
                'persen'            => $totalSiswaAktif > 0
                    ? round(($siswaYangSudahDapat / $totalSiswaAktif) * 100, 1)
                    : 0,
            ],
            'total_nilai_diinput'     => $totalNilaiDiinput,
            'pemasukan_spp_bulan_ini' => (float) $pemasukanSPP,
            'jumlah_siswa_menunggak'  => $siswaMenunggak,
            'log_aktivitas'           => $logAktivitas,
        ];
    }

    private function dataGuru($user): array
    {
        $guru = $user->guru;
        if (! $guru) {
            return ['error' => 'Profil guru tidak ditemukan.'];
        }

        $hariIni = self::HARI_MAP[now()->format('l')];

        $jadwalHariIni = $guru->jadwals()
            ->where('hari', $hariIni)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with(['kelas:id,nama_kelas', 'mataPelajaran:id,nama_mapel'])
            ->orderBy('jam_mulai')
            ->get(['id', 'kelas_id', 'mata_pelajaran_id', 'hari', 'jam_mulai', 'jam_selesai', 'ruangan']);

        $jadwalIds  = $jadwalHariIni->pluck('id')->all();
        $sudahAbsen = Absensi::whereIn('jadwal_id', $jadwalIds)
            ->whereDate('tanggal', today())
            ->pluck('jadwal_id')
            ->all();

        $jadwalHariIni = $jadwalHariIni->map(function ($jadwal) use ($sudahAbsen) {
            $jadwal->absensi_filled = in_array($jadwal->id, $sudahAbsen);
            return $jadwal;
        });

        // Delegasi ke GuruService
        $tugasBelumDinilai = $this->guruService->tugasPendingGrading(
            $guru,
            $this->semester,
            $this->tahunAjaran
        );

        $totalTugasAktif = $tugasBelumDinilai->count();

        return [
            'jadwal_hari_ini'       => $jadwalHariIni,
            'total_jadwal_hari_ini' => $jadwalHariIni->count(),
            'kelas_diampu'          => $jadwalHariIni->unique('kelas_id')->count(),
            'tugas_belum_dinilai'   => $tugasBelumDinilai,
            'kelas_belum_absen'     => $jadwalHariIni->where('absensi_filled', false)->values(),
            'ada_kelas_belum_absen' => $jadwalHariIni->where('absensi_filled', false)->isNotEmpty(),
            'total_tugas_aktif'     => $totalTugasAktif,
        ];
    }

    private function dataSiswa($user): array
    {
        $siswa = $user->siswa;
        if (! $siswa) {
            return ['error' => 'Profil siswa tidak ditemukan.'];
        }

        $hariIni = self::HARI_MAP[now()->format('l')];

        $jadwalHariIni = collect();
        if ($siswa->kelas_id) {
            $jadwalHariIni = $siswa->kelas->jadwals()
                ->where('hari', $hariIni)
                ->where('status', 'aktif')
                ->where('semester', $this->semester)
                ->where('tahun_ajaran', $this->tahunAjaran)
                ->with(['mataPelajaran:id,nama_mapel,kode_mapel', 'guru:id,nama'])
                ->orderBy('jam_mulai')
                ->get(['id', 'kelas_id', 'mata_pelajaran_id', 'guru_id', 'hari', 'jam_mulai', 'jam_selesai', 'ruangan']);
        }

        $semuaTugasAktif = Tugas::where('kelas_id', $siswa->kelas_id)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with(['mataPelajaran:id,nama_mapel', 'guru:id,nama'])
            ->orderBy('tanggal_deadline')
            ->get();

        $nilaiTugasIds = Nilai::where('siswa_id', $siswa->id)
            ->whereNotNull('tugas_id')
            ->pluck('tugas_id')
            ->all();

        $tugasBelumDikerjakan = $semuaTugasAktif
            ->filter(fn($t) => $t->tanggal_deadline >= today() && ! in_array($t->id, $nilaiTugasIds))
            ->values();

        $semuaNilai = Nilai::where('siswa_id', $siswa->id)
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with('mataPelajaran:id,nama_mapel,kkm')
            ->get();

        $absensiStats = Absensi::where('siswa_id', $siswa->id)
            ->whereYear('tanggal', now()->year)
            ->whereMonth('tanggal', now()->month)
            ->selectRaw('status_kehadiran, COUNT(*) as total')
            ->groupBy('status_kehadiran')
            ->get()
            ->keyBy('status_kehadiran');

        $totalAbsensi    = $absensiStats->sum('total');
        $hadir           = $absensiStats->get('hadir')?->total ?? 0;
        $persenKehadiran = $totalAbsensi > 0
            ? round(($hadir / $totalAbsensi) * 100, 1)
            : 0;

        $tugasAktifCount = $semuaTugasAktif->count();

        return [
            'jadwal_hari_ini'       => $jadwalHariIni,
            'tugas_belum_dikerjakan' => $tugasBelumDikerjakan,
            'persen_kehadiran'      => $persenKehadiran,
            'total_hadir'           => $hadir,
            'total_pertemuan'       => $totalAbsensi,
            'rata_nilai_tugas'      => round(
                $semuaNilai->whereIn('jenis_nilai', ['tugas', 'harian'])->avg('nilai') ?? 0,
                2
            ),
            'total_tugas_aktif'     => $tugasAktifCount,
        ];
    }
}
