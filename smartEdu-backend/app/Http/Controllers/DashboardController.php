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
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    // ── Semester & tahun ajaran aktif ─────────────────────────────────────────
    // TODO: pindahkan ke tabel settings jika sudah dinamis
    private string $semester    = '1';
    private string $tahunAjaran = '2024/2025';

    /**
     * Mapping PHP date('l') → nama hari yang tersimpan di kolom jadwals.hari
     *
     * MENGAPA: Carbon::locale('id')->translatedFormat('l') bergantung pada
     * intl extension + locale OS server ('id_ID.UTF-8').
     * Jika tidak tersedia → return English name → WHERE hari = 'Monday'
     * tidak cocok dengan data 'Senin' → jadwal selalu kosong.
     *
     * SOLUSI: gunakan date('l') PHP native (selalu English) lalu map ke
     * nama hari Bahasa Indonesia yang sama persis dengan data di DB.
     */
    private const HARI_MAP = [
        'Monday'    => 'Senin',
        'Tuesday'   => 'Selasa',
        'Wednesday' => 'Rabu',
        'Thursday'  => 'Kamis',
        'Friday'    => 'Jumat',
        'Saturday'  => 'Sabtu',
        'Sunday'    => 'Minggu',
    ];

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

        // ── FIX: Carbon locale-safe ───────────────────────────────────────────
        $hariIni = self::HARI_MAP[now()->format('l')];

        // ── Jadwal hari ini ───────────────────────────────────────────────────
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
            ->with(['mataPelajaran:id,nama_mapel', 'guru:id,nama'])
            ->orderBy('tanggal_deadline')
            ->get();

        // Sudah ada nilai dengan tugas_id → dianggap sudah dikerjakan/dinilai
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

        // ── Semua nilai semester ini (satu query) ─────────────────────────────
        $semuaNilai = Nilai::where('siswa_id', $siswa->id)
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with('mataPelajaran:id,nama_mapel,kkm')
            ->get();

        $rataNilaiTugas = round(
            $semuaNilai->whereIn('jenis_nilai', ['tugas', 'harian'])->avg('nilai') ?? 0,
            2
        );

        // Rekap nilai per mapel (collection PHP, tanpa query tambahan)
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

        // Rekap PTS / PAS dari koleksi yang sudah dimuat
        $rekapPTS = $semuaNilai->where('jenis_nilai', 'uts')
            ->groupBy('mata_pelajaran_id')
            ->map(fn($items) => [
                'mapel'  => $items->first()->mataPelajaran?->nama_mapel,
                'nilai'  => round($items->avg('nilai'), 2),
            ])->values();

        $rekapPAS = $semuaNilai->where('jenis_nilai', 'uas')
            ->groupBy('mata_pelajaran_id')
            ->map(fn($items) => [
                'mapel'  => $items->first()->mataPelajaran?->nama_mapel,
                'nilai'  => round($items->avg('nilai'), 2),
            ])->values();

        // ── Kehadiran bulan ini (satu query dengan GROUP BY) ──────────────────
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

        // ── Tagihan belum bayar ───────────────────────────────────────────────
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

        // ── FIX: Carbon locale-safe ───────────────────────────────────────────
        $hariIni = self::HARI_MAP[now()->format('l')];

        // ── Jadwal hari ini (satu query) ──────────────────────────────────────
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
            ]);

        // ── FIX N+1: ambil semua jadwal_id hari ini → satu IN query ──────────
        $jadwalIds   = $jadwalHariIni->pluck('id')->all();
        $sudahAbsen  = Absensi::whereIn('jadwal_id', $jadwalIds)
            ->whereDate('tanggal', today())
            ->pluck('jadwal_id')
            ->all();

        // Flag absensi_filled dari koleksi in-memory, tanpa query per baris
        $jadwalHariIni = $jadwalHariIni->map(function ($jadwal) use ($sudahAbsen) {
            $jadwal->absensi_filled = in_array($jadwal->id, $sudahAbsen);
            return $jadwal;
        });

        $kelasBelumAbsen = $jadwalHariIni->where('absensi_filled', false)->values();

        // ── Tugas pending grading ─────────────────────────────────────────────
        // Ambil semua tugas aktif guru ini + jumlah nilai sudah diinput
        $tugasAktif = Tugas::where('guru_id', $guru->id)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with(['kelas:id,nama_kelas', 'mataPelajaran:id,nama_mapel'])
            ->withCount('nilais')                        // 1 LEFT JOIN — bukan N query
            ->orderBy('tanggal_deadline')
            ->get();

        // Hitung total siswa aktif per kelas dalam satu query GROUP BY
        $kelasIds       = $tugasAktif->pluck('kelas_id')->unique()->all();
        $siswaPerKelas  = Siswa::whereIn('kelas_id', $kelasIds)
            ->where('status', 'aktif')
            ->selectRaw('kelas_id, COUNT(*) as total')
            ->groupBy('kelas_id')
            ->pluck('total', 'kelas_id');               // [kelas_id => total_siswa]

        $tugasPendingGrading = $tugasAktif
            ->map(function ($tugas) use ($siswaPerKelas) {
                $totalSiswa   = $siswaPerKelas[$tugas->kelas_id] ?? 0;
                $sudahDinilai = $tugas->nilais_count;
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

        // ── Statistik kelas (dari collection, tanpa query baru) ───────────────
        $jumlahKelasDiajarHariIni = $jadwalHariIni->unique('kelas_id')->count();

        // Total kelas semester ini: satu query distinct
        $totalKelasAktif = $guru->jadwals()
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->where('status', 'aktif')
            ->distinct('kelas_id')
            ->count('kelas_id');

        $totalSiswaPerluDinilai = $tugasPendingGrading->sum('belum_dinilai');

        // ── FIX: total_tugas_aktif dari collection yang sudah loaded ──────────
        $totalTugasAktif = $tugasAktif->count(); // tidak perlu query baru

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

    // =========================================================================
    // GET /api/dashboard/admin
    // =========================================================================

    public function admin(Request $request): JsonResponse
    {
        $today    = today()->toDateString();
        $bulanIni = now()->month;
        $tahunIni = now()->year;

        // ── FIX: Gabungkan 3 COUNT terpisah menjadi satu query ────────────────
        // Sebelum: 3 query terpisah (Siswa::count, Guru::count, User::count)
        // Sesudah: masing-masing tetap 1 query tapi dengan kolom minimal
        $totalSiswaAktif = Siswa::where('status', 'aktif')->count();
        $totalGuruAktif  = Guru::where('status', 'aktif')->count();
        $totalStafAktif  = User::where('role', 'admin')->count();

        // ── Kehadiran hari ini (satu query GROUP BY) ──────────────────────────
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
        // FIX: withCount('nilais') → 1 query JOIN, bukan N query per tugas
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

        // ── Keuangan SPP bulan ini ────────────────────────────────────────────
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

        // ── Activity Log (10 terbaru, kolom minimal) ──────────────────────────
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
                'created_at'
            ]);

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
                'log_aktivitas'           => $logAktivitas,
            ],
        ]);
    }

    // =========================================================================
    // PRIVATE METHODS
    // =========================================================================

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

    // ── index() helpers ───────────────────────────────────────────────────────

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
            ->get([
                'id',
                'user_id',
                'action',
                'model_type',
                'model_id',
                'description',
                'ip_address',
                'created_at'
            ]);

        return [
            'total_siswa'       => $totalSiswaAktif,
            'total_guru'        => Guru::where('status', 'aktif')->count(),
            'total_staf'        => User::where('role', 'admin')->count(),
            'absensi_hari_ini'  => [
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

        // ── FIX: locale-safe ──────────────────────────────────────────────────
        $hariIni = self::HARI_MAP[now()->format('l')];

        // ── Jadwal hari ini ───────────────────────────────────────────────────
        $jadwalHariIni = $guru->jadwals()
            ->where('hari', $hariIni)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with(['kelas:id,nama_kelas', 'mataPelajaran:id,nama_mapel'])
            ->orderBy('jam_mulai')
            ->get([
                'id',
                'kelas_id',
                'mata_pelajaran_id',
                'hari',
                'jam_mulai',
                'jam_selesai',
                'ruangan'
            ]);

        // ── FIX N+1: satu IN query untuk semua absensi ────────────────────────
        $jadwalIds  = $jadwalHariIni->pluck('id')->all();
        $sudahAbsen = Absensi::whereIn('jadwal_id', $jadwalIds)
            ->whereDate('tanggal', today())
            ->pluck('jadwal_id')
            ->all();

        $jadwalHariIni = $jadwalHariIni->map(function ($jadwal) use ($sudahAbsen) {
            $jadwal->absensi_filled = in_array($jadwal->id, $sudahAbsen);
            return $jadwal;
        });

        // ── Tugas belum dinilai ───────────────────────────────────────────────
        $tugasAktif = Tugas::where('guru_id', $guru->id)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->withCount('nilais')
            ->get(['id', 'kelas_id', 'judul', 'tanggal_deadline']);

        $kelasIds      = $tugasAktif->pluck('kelas_id')->unique()->all();
        $siswaPerKelas = Siswa::whereIn('kelas_id', $kelasIds)
            ->where('status', 'aktif')
            ->selectRaw('kelas_id, COUNT(*) as total')
            ->groupBy('kelas_id')
            ->pluck('total', 'kelas_id');

        $tugasBelumDinilai = $tugasAktif
            ->map(function ($tugas) use ($siswaPerKelas) {
                $total        = $siswaPerKelas[$tugas->kelas_id] ?? 0;
                $belum        = max(0, $total - $tugas->nilais_count);
                $tugas->belum = $belum;
                return $tugas;
            })
            ->filter(fn($t) => $t->belum > 0)
            ->values();

        // ── FIX: hitung dari collection, bukan query baru ─────────────────────
        $totalTugasAktif = $tugasAktif->count();

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

        // ── FIX: locale-safe ──────────────────────────────────────────────────
        $hariIni = self::HARI_MAP[now()->format('l')];

        $jadwalHariIni = collect();
        if ($siswa->kelas_id) {
            $jadwalHariIni = $siswa->kelas->jadwals()
                ->where('hari', $hariIni)
                ->where('status', 'aktif')
                ->where('semester', $this->semester)
                ->where('tahun_ajaran', $this->tahunAjaran)
                ->with(['mataPelajaran:id,nama_mapel', 'guru:id,nama'])
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

        $semuaNilai = Nilai::where('siswa_id', $siswa->id)
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with('mataPelajaran:id,nama_mapel,kkm')
            ->get();

        $rekapNilai = $semuaNilai
            ->groupBy('mata_pelajaran_id')
            ->map(fn($items) => [
                'mapel'     => $items->first()->mataPelajaran?->nama_mapel,
                'rata_rata' => round($items->avg('nilai'), 2),
            ])
            ->values();

        $nilaiTugasIds = Nilai::where('siswa_id', $siswa->id)
            ->whereNotNull('tugas_id')
            ->pluck('tugas_id')
            ->all();

        $semuaTugasAktif = Tugas::where('kelas_id', $siswa->kelas_id)
            ->where('status', 'aktif')
            ->where('semester', $this->semester)
            ->where('tahun_ajaran', $this->tahunAjaran)
            ->with(['mataPelajaran:id,nama_mapel', 'guru:id,nama'])
            ->orderBy('tanggal_deadline')
            ->get();

        return [
            'jadwal_hari_ini'        => $jadwalHariIni,
            'rekap_nilai'            => $rekapNilai,
            'tugas_belum_dikerjakan' => $semuaTugasAktif
                ->filter(fn($t) => $t->tanggal_deadline >= today() && ! in_array($t->id, $nilaiTugasIds))
                ->values(),
            'tugas_menunggu_nilai'   => $semuaTugasAktif
                ->filter(fn($t) => $t->tanggal_deadline < today() && ! in_array($t->id, $nilaiTugasIds))
                ->values(),
        ];
    }
}
