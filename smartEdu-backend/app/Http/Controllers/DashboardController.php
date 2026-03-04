<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\Guru;
use App\Models\Kelas;
use App\Models\User;
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
    // Semester & tahun ajaran aktif
    // TODO: pindahkan ke config/akademik.php atau tabel settings jika sudah dinamis
    private string $semester    = '1';
    private string $tahunAjaran = '2024/2025';

    // =========================================================================
    // SINGLE ENDPOINT — dipertahankan, masih dikonsumsi Dashboard.jsx lama
    // =========================================================================

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

    // =========================================================================
    // GET /api/dashboard/siswa
    // =========================================================================

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

        $hariIni = Carbon::now()->locale('id')->translatedFormat('l'); // 'Senin', dll

        // ── Jadwal hari ini ──────────────────────────────────────────────────
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
                ->get([
                    'id',
                    'kelas_id',
                    'mata_pelajaran_id',
                    'guru_id',
                    'hari',
                    'jam_mulai',
                    'jam_selesai',
                    'ruangan'
                ]);
        }

        // ── Tugas aktif di kelas siswa ────────────────────────────────────────
        $semuaTugasAktif = Tugas::where('kelas_id', $siswa->kelas_id)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with([
                'mataPelajaran:id,nama_mapel',
                'guru:id,nama',
            ])
            ->orderBy('tanggal_deadline')
            ->get();

        // Sudah ada entri nilai dengan tugas_id → dianggap sudah dikerjakan/dinilai
        $nilaiTugasIds = Nilai::where('siswa_id', $siswa->id)
            ->whereNotNull('tugas_id')
            ->pluck('tugas_id')
            ->toArray();

        // Tugas belum dikerjakan: deadline belum lewat & belum ada nilai
        $tugasBelumDikerjakan = $semuaTugasAktif
            ->filter(
                fn($t) =>
                $t->tanggal_deadline >= today() &&
                    ! in_array($t->id, $nilaiTugasIds)
            )
            ->values();

        // Tugas menunggu nilai: deadline sudah lewat & belum ada nilai
        $tugasMenungguNilai = $semuaTugasAktif
            ->filter(
                fn($t) =>
                $t->tanggal_deadline < today() &&
                    ! in_array($t->id, $nilaiTugasIds)
            )
            ->values();

        // ── Semua nilai semester ini ──────────────────────────────────────────
        $semuaNilai = Nilai::where('siswa_id', $siswa->id)
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with('mataPelajaran:id,nama_mapel,kkm')
            ->get();

        // Rata-rata nilai tugas harian
        $rataNilaiTugas = round(
            $semuaNilai->whereIn('jenis_nilai', ['tugas', 'harian'])->avg('nilai') ?? 0,
            2
        );

        // Rekap PTS per mapel (jenis_nilai = 'pts')
        $rekapPTS = $semuaNilai
            ->where('jenis_nilai', 'pts')
            ->groupBy('mata_pelajaran_id')
            ->map(fn($items) => [
                'mapel'  => $items->first()->mataPelajaran?->nama_mapel,
                'kkm'    => (float) ($items->first()->mataPelajaran?->kkm ?? 0),
                'nilai'  => round($items->avg('nilai'), 2),
                'lulus'  => round($items->avg('nilai'), 2) >= (float) ($items->first()->mataPelajaran?->kkm ?? 0),
            ])
            ->values();

        // Rekap PAS per mapel (jenis_nilai = 'uas' → PAS)
        $rekapPAS = $semuaNilai
            ->where('jenis_nilai', 'uas')
            ->groupBy('mata_pelajaran_id')
            ->map(fn($items) => [
                'mapel'  => $items->first()->mataPelajaran?->nama_mapel,
                'kkm'    => (float) ($items->first()->mataPelajaran?->kkm ?? 0),
                'nilai'  => round($items->avg('nilai'), 2),
                'lulus'  => round($items->avg('nilai'), 2) >= (float) ($items->first()->mataPelajaran?->kkm ?? 0),
            ])
            ->values();

        // ── Kehadiran bulan ini ───────────────────────────────────────────────
        $absensiQuery = Absensi::where('siswa_id', $siswa->id)
            ->whereYear('tanggal', now()->year)
            ->whereMonth('tanggal', now()->month);

        $totalAbsensi = (clone $absensiQuery)->count();
        $hadir        = (clone $absensiQuery)->where('status_kehadiran', 'hadir')->count();
        $persenKehadiran = $totalAbsensi > 0
            ? round(($hadir / $totalAbsensi) * 100, 1)
            : 0;

        // ── Tagihan ──────────────────────────────────────────────────────────
        $tagihanBelumBayar = Pembayaran::where('siswa_id', $siswa->id)
            ->where('status_pembayaran', 'belum_bayar')
            ->get(['id', 'jenis_pembayaran', 'jumlah', 'tanggal_jatuh_tempo', 'keterangan']);

        $sisaTagihan = $tagihanBelumBayar->sum('jumlah');

        return response()->json([
            'success' => true,
            'message' => 'Dashboard siswa berhasil diambil',
            'data'    => [
                // Sapaan
                'nama'                   => $siswa->nama,
                'kelas'                  => $siswa->kelas?->nama_kelas,
                'tingkat'                => $siswa->kelas?->tingkat,

                // Akademik
                'rata_nilai_tugas'       => $rataNilaiTugas,
                'rekap_pts'              => $rekapPTS,
                'rekap_pas'              => $rekapPAS,

                // Kehadiran
                'persen_kehadiran'       => $persenKehadiran,
                'total_hadir'            => $hadir,
                'total_pertemuan'        => $totalAbsensi,

                // Keuangan
                'sisa_tagihan'           => (float) $sisaTagihan,
                'detail_tagihan'         => $tagihanBelumBayar,

                // Jadwal & tugas
                'jadwal_hari_ini'        => $jadwalHariIni,
                'tugas_belum_dikerjakan' => $tugasBelumDikerjakan,
                'tugas_menunggu_nilai'   => $tugasMenungguNilai,

                // Pengumuman
                'pengumuman'             => $this->getPengumuman('siswa'),
            ],
        ]);
    }

    // =========================================================================
    // GET /api/dashboard/guru
    // =========================================================================

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

        $hariIni = Carbon::now()->locale('id')->translatedFormat('l');

        // ── Jadwal hari ini + flag absensi_filled ────────────────────────────
        $jadwalHariIni = $guru->jadwals()
            ->where('hari', $hariIni)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with([
                'kelas:id,nama_kelas,tingkat',
                'mataPelajaran:id,nama_mapel',
            ])
            ->orderBy('jam_mulai')
            ->get([
                'id',
                'kelas_id',
                'mata_pelajaran_id',
                'hari',
                'jam_mulai',
                'jam_selesai',
                'ruangan'
            ])
            ->map(function ($jadwal) {
                // true jika sudah ada minimal 1 record absensi untuk jadwal ini hari ini
                $jadwal->absensi_filled = Absensi::where('jadwal_id', $jadwal->id)
                    ->whereDate('tanggal', today())
                    ->exists();
                return $jadwal;
            });

        // Jadwal yang belum diisi absensinya
        $kelasBelumAbsen = $jadwalHariIni->where('absensi_filled', false)->values();

        // ── Tugas pending grading ────────────────────────────────────────────
        // Per tugas: hitung berapa siswa aktif di kelas vs yang sudah dinilai
        $tugasPendingGrading = Tugas::where('guru_id', $guru->id)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with([
                'kelas:id,nama_kelas',
                'mataPelajaran:id,nama_mapel',
            ])
            ->orderBy('tanggal_deadline')
            ->get()
            ->map(function ($tugas) {
                $totalSiswa   = Siswa::where('kelas_id', $tugas->kelas_id)
                    ->where('status', 'aktif')
                    ->count();
                $sudahDinilai = Nilai::where('tugas_id', $tugas->id)->count();
                $belumDinilai = max(0, $totalSiswa - $sudahDinilai);

                $tugas->total_siswa    = $totalSiswa;
                $tugas->sudah_dinilai  = $sudahDinilai;
                $tugas->belum_dinilai  = $belumDinilai;
                $tugas->persen_selesai = $totalSiswa > 0
                    ? round(($sudahDinilai / $totalSiswa) * 100, 1)
                    : 0;
                return $tugas;
            })
            ->filter(fn($t) => $t->belum_dinilai > 0)
            ->values();

        // ── Statistik kelas ───────────────────────────────────────────────────
        $jumlahKelasDiajarHariIni = $jadwalHariIni->unique('kelas_id')->count();

        $totalKelasAktif = $guru->jadwals()
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->where('status', 'aktif')
            ->distinct('kelas_id')
            ->count('kelas_id');

        // ── Total tugas butuh dinilai (sum semua siswa belum dapat nilai) ─────
        $totalSiswaPerluDinilai = $tugasPendingGrading->sum('belum_dinilai');

        return response()->json([
            'success' => true,
            'message' => 'Dashboard guru berhasil diambil',
            'data'    => [
                // Sapaan
                'nama'                       => $guru->nama,
                'nip'                        => $guru->nip,

                // Statistik
                'jumlah_kelas_hari_ini'      => $jumlahKelasDiajarHariIni,
                'total_kelas_semester_ini'   => $totalKelasAktif,
                'jumlah_tugas_perlu_dinilai' => $totalSiswaPerluDinilai,

                // Jadwal
                'jadwal_hari_ini'            => $jadwalHariIni,

                // Notifikasi absensi belum diisi
                'kelas_belum_absen'          => $kelasBelumAbsen,
                'ada_kelas_belum_absen'      => $kelasBelumAbsen->isNotEmpty(),

                // Penilaian
                'tugas_pending_grading'      => $tugasPendingGrading,

                // Pengumuman internal
                'pengumuman'                 => $this->getPengumuman('guru'),
            ],
        ]);
    }

    // =========================================================================
    // GET /api/dashboard/admin
    // =========================================================================

    public function admin(Request $request): JsonResponse
    {
        $today    = today()->toDateString();
        $bulanIni = now()->month;
        $tahunIni = now()->year;

        // ── Statistik pengguna aktif ──────────────────────────────────────────
        $totalSiswaAktif = Siswa::where('status', 'aktif')->count();
        $totalGuruAktif  = Guru::where('status', 'aktif')->count();
        $totalStafAktif  = User::where('role', 'admin')->count();

        // ── Kehadiran sekolah hari ini ────────────────────────────────────────
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

        // ── Progres input nilai per guru ──────────────────────────────────────
        // Eager load tugas + nilais sekaligus untuk menghindari N+1
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
                $tugasSelesai = $guru->tugass
                    ->filter(fn($t) => $t->nilais_count > 0)
                    ->count();
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

        // ── Keuangan SPP bulan ini ────────────────────────────────────────────
        $pemasukanSPP = Pembayaran::where('jenis_pembayaran', 'spp')
            ->where('status_pembayaran', 'lunas')
            ->whereMonth('tanggal_pembayaran', $bulanIni)
            ->whereYear('tanggal_pembayaran', $tahunIni)
            ->sum('jumlah');

        // Siswa yang punya tagihan SPP jatuh tempo & belum dibayar
        $siswaMenunggak = Pembayaran::where('jenis_pembayaran', 'spp')
            ->where('status_pembayaran', 'belum_bayar')
            ->where('tanggal_jatuh_tempo', '<', today())
            ->distinct('siswa_id')
            ->count('siswa_id');

        // ── Activity Log (10 terbaru) ─────────────────────────────────────────
        $logAktivitas = ActivityLog::with('user:id,name,role')
            ->latest()
            ->take(10)
            ->get([
                'id',
                'user_id',
                'action',
                'model_type',
                'model_id',
                'description',
                'ip_address',
                'created_at',
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Dashboard admin berhasil diambil',
            'data'    => [
                // Pengguna aktif
                'total_siswa_aktif'          => $totalSiswaAktif,
                'total_guru_aktif'           => $totalGuruAktif,
                'total_staf_aktif'           => $totalStafAktif,

                // Kehadiran hari ini
                'kehadiran_hari_ini'         => [
                    'hadir'       => $hadirHariIni,
                    'sakit'       => $absensiHariIni->get('sakit')?->total ?? 0,
                    'izin'        => $absensiHariIni->get('izin')?->total  ?? 0,
                    'alpa'        => $absensiHariIni->get('alpa')?->total  ?? 0,
                    'total'       => $totalAbsenHariIni,
                    'persen_hadir' => $persenHadirHariIni,
                ],

                // Input nilai
                'progres_input_nilai'        => $progresNilaiGuru,

                // Keuangan
                'pemasukan_spp_bulan_ini'    => (float) $pemasukanSPP,
                'jumlah_siswa_menunggak'     => $siswaMenunggak,

                // Log aktivitas
                'log_aktivitas'              => $logAktivitas,
            ],
        ]);
    }

    // =========================================================================
    // PRIVATE METHODS — dipakai index() dan dedicated endpoints
    // =========================================================================

    /**
     * Ambil pengumuman aktif. Jika $targetAudience diisi, filter ke audience
     * tersebut + 'semua'. Jika null, ambil semua tanpa filter audience.
     */
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

        return $query->get([
            'id',
            'judul',
            'isi',
            'tipe',
            'target_audience',
            'tanggal_mulai',
            'tanggal_selesai',
            'created_at',
        ]);
    }

    // ── Dipakai oleh index() ─────────────────────────────────────────────────

    private function dataAdmin(): array
    {
        $absensi7Hari = Absensi::selectRaw('tanggal, status_kehadiran, COUNT(*) as total')
            ->where('tanggal', '>=', now()->subDays(6)->toDateString())
            ->groupBy('tanggal', 'status_kehadiran')
            ->orderBy('tanggal')
            ->get()
            ->groupBy('tanggal');

        $totalSiswaAktif     = Siswa::where('status', 'aktif')->count();
        $siswaYangSudahDapat = Nilai::where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->distinct('siswa_id')
            ->count('siswa_id');

        $logAktivitas = ActivityLog::with('user:id,name,role')
            ->latest()
            ->take(10)
            ->get();

        $absensiStats = Absensi::whereDate('tanggal', today())
            ->selectRaw('status_kehadiran, COUNT(*) as total')
            ->groupBy('status_kehadiran')
            ->get()
            ->keyBy('status_kehadiran');

        $totalNilaiDiinput = Nilai::where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->count();

        $pemasukanSPP = Pembayaran::where('jenis_pembayaran', 'spp')
            ->where('status_pembayaran', 'lunas')
            ->whereMonth('tanggal_pembayaran', now()->month)
            ->whereYear('tanggal_pembayaran', now()->year)
            ->sum('jumlah');

        $siswaMenunggak = Pembayaran::where('jenis_pembayaran', 'spp')
            ->where('status_pembayaran', 'belum_bayar')
            ->where('tanggal_jatuh_tempo', '<', today())
            ->distinct('siswa_id')
            ->count('siswa_id');

        return [
            'total_siswa'              => $totalSiswaAktif,
            'total_guru'               => Guru::where('status', 'aktif')->count(),
            'total_staf'               => User::where('role', 'admin')->count(),
            'absensi_7_hari'           => $absensi7Hari,
            'absensi_hari_ini'         => [
                'hadir' => $absensiStats['hadir']->total ?? 0,
                'sakit' => $absensiStats['sakit']->total ?? 0,
                'izin'  => $absensiStats['izin']->total  ?? 0,
                'alpa'  => $absensiStats['alpa']->total  ?? 0,
            ],
            'progres_input_nilai'      => [
                'total_siswa'       => $totalSiswaAktif,
                'sudah_dapat_nilai' => $siswaYangSudahDapat,
                'persen'            => $totalSiswaAktif > 0
                    ? round(($siswaYangSudahDapat / $totalSiswaAktif) * 100, 1)
                    : 0,
            ],
            'total_nilai_diinput'      => $totalNilaiDiinput,
            'pemasukan_spp_bulan_ini'  => (float) $pemasukanSPP,
            'jumlah_siswa_menunggak'   => $siswaMenunggak,
            'log_aktivitas'            => $logAktivitas,
        ];
    }

    private function dataGuru($user): array
    {
        $guru = $user->guru;
        if (! $guru) {
            return ['error' => 'Profil guru tidak ditemukan.'];
        }

        $hariIni = Carbon::now()->locale('id')->translatedFormat('l');

        $jadwalHariIni = $guru->jadwals()
            ->where('hari', $hariIni)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with(['kelas', 'mataPelajaran'])
            ->orderBy('jam_mulai')
            ->get()
            ->map(function ($jadwal) {
                $jadwal->absensi_filled = Absensi::where('jadwal_id', $jadwal->id)
                    ->whereDate('tanggal', today())
                    ->exists();
                return $jadwal;
            });

        $kelasDiajar = Kelas::whereHas(
            'jadwals',
            fn($q) =>
            $q->where('guru_id', $guru->id)
                ->where('semester', $this->semester)
                ->where('tahun_ajaran', $this->tahunAjaran)
                ->where('status', 'aktif')
        )->with('siswas:id,kelas_id,nama')->get();

        $tugasBelumDinilai = $guru->tugasBelumDinilai();

        $absensiStats = $guru->absensis()
            ->whereMonth('tanggal', now()->month)
            ->whereYear('tanggal', now()->year)
            ->selectRaw('status_kehadiran, COUNT(*) as total')
            ->groupBy('status_kehadiran')
            ->get()
            ->keyBy('status_kehadiran');

        $totalNilaiDiinput = $guru->nilais()
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->count();

        return [
            'jadwal_hari_ini'       => $jadwalHariIni,
            'total_jadwal_hari_ini' => $jadwalHariIni->count(),
            'kelas_diampu'          => $kelasDiajar->count(),
            'detail_kelas_diampu'   => $kelasDiajar,
            'tugas_belum_dinilai'   => $tugasBelumDinilai,
            'kelas_belum_absen'     => $jadwalHariIni->where('absensi_filled', false)->values(),
            'ada_kelas_belum_absen' => $jadwalHariIni->where('absensi_filled', false)->isNotEmpty(),
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

    private function dataSiswa($user): array
    {
        $siswa = $user->siswa;
        if (! $siswa) {
            return ['error' => 'Profil siswa tidak ditemukan.'];
        }

        $hariIni = Carbon::now()->locale('id')->translatedFormat('l');

        $jadwalHariIni = collect();
        if ($siswa->kelas_id) {
            $jadwalHariIni = $siswa->kelas->jadwals()
                ->where('hari', $hariIni)
                ->where('status', 'aktif')
                ->where('semester', $this->semester)
                ->where('tahun_ajaran', $this->tahunAjaran)
                ->with(['mataPelajaran', 'guru'])
                ->orderBy('jam_mulai')
                ->get();
        }

        $semuaNilai = Nilai::where('siswa_id', $siswa->id)
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with(['mataPelajaran:id,nama_mapel,kkm'])
            ->get();

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

        $nilaiTugasIds = $semuaNilai->whereNotNull('tugas_id')->pluck('tugas_id')->toArray();

        $semuaTugasAktif = Tugas::where('kelas_id', $siswa->kelas_id)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with(['mataPelajaran', 'guru'])
            ->orderBy('tanggal_deadline')
            ->get();

        $tugasBelumDikerjakan = $semuaTugasAktif
            ->filter(
                fn($t) =>
                $t->tanggal_deadline >= today() &&
                    ! in_array($t->id, $nilaiTugasIds)
            )->values();

        return [
            'siswa'              => $siswa->load('kelas:id,nama_kelas,tingkat'),
            'jadwal_hari_ini'    => $jadwalHariIni,
            'nilai_terbaru'      => $semuaNilai->take(5),
            'rekap_nilai'        => $rekapNilai,
            'tugas_terdekat'     => $tugasBelumDikerjakan->take(3),
            'persen_hadir'       => $siswa->persenHadirBulanIni(),
            'rata_nilai'         => $siswa->rataNilaiSemesterIni($this->semester, $this->tahunAjaran),
            'sisa_tagihan'       => (float) $siswa->pembayarans()
                ->where('status_pembayaran', 'belum_bayar')->sum('jumlah'),
            'pembayaran_pending' => $siswa->pembayarans()
                ->where('status_pembayaran', 'belum_bayar')->count(),
        ];
    }
}
