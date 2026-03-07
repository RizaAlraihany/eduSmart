<?php

namespace App\Http\Controllers;

use App\Models\Nilai;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NilaiController extends Controller
{
    /**
     * Enum jenis_nilai valid — sinkron dengan migration 2026_03_01_000002.
     * FIX: Tambahkan 'pts' yang ada di DB tapi tidak ada di validasi sebelumnya.
     */
    private const JENIS_NILAI = 'required|in:tugas,pts,uts,uas,praktek,harian';

    /**
     * GET /api/nilai
     *
     * FIX: Tambahkan filter by siswa_id untuk role siswa.
     * Sebelumnya: tidak ada filter siswa → return semua nilai (data bocor).
     * Sekarang: jika user isSiswa(), auto-filter by siswa_id milik sendiri.
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Nilai::with(['siswa', 'kelas', 'mataPelajaran', 'guru']);

        if ($user->isGuru()) {
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $query->where('guru_id', $guru->id);
        } elseif ($user->isSiswa()) {
            // Siswa hanya lihat nilai miliknya sendiri
            $siswa = $user->siswa;
            if (! $siswa) {
                return $this->successResponse([], 'Profil siswa tidak ditemukan.');
            }
            $query->where('siswa_id', $siswa->id);
        }

        // Filter tambahan
        if ($request->filled('siswa_id') && ! $user->isSiswa()) {
            // Siswa tidak bisa override filter siswa_id
            $query->where('siswa_id', $request->siswa_id);
        }
        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }
        if ($request->filled('mata_pelajaran_id')) {
            $query->where('mata_pelajaran_id', $request->mata_pelajaran_id);
        }
        if ($request->filled('jenis_nilai')) {
            $query->where('jenis_nilai', $request->jenis_nilai);
        }
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->filled('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }

        $nilais = $query->latest()->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($nilais, 'Daftar Data Nilai');
    }

    /**
     * POST /api/nilai
     * Hanya admin + guru (dikontrol di api.php)
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'siswa_id'          => 'required|exists:siswas,id',
            'kelas_id'          => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'jenis_nilai'       => self::JENIS_NILAI,
            'nilai'             => 'required|numeric|min:0|max:100',
            'semester'          => 'required|in:1,2',
            'tahun_ajaran'      => 'required|string|max:20',
            'keterangan'        => 'nullable|string',
        ]);

        if ($user->isGuru()) {
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $guruId = $guru->id;
        } else {
            $request->validate(['guru_id' => 'required|exists:gurus,id']);
            $guruId = $request->guru_id;
        }

        $nilai = Nilai::create([
            'siswa_id'          => $request->siswa_id,
            'kelas_id'          => $request->kelas_id,
            'mata_pelajaran_id' => $request->mata_pelajaran_id,
            'guru_id'           => $guruId,
            'jenis_nilai'       => $request->jenis_nilai,
            'nilai'             => $request->nilai,
            'semester'          => $request->semester,
            'tahun_ajaran'      => $request->tahun_ajaran,
            'keterangan'        => $request->keterangan,
        ]);

        ActivityLog::catat(
            $user,
            'input_nilai',
            $nilai,
            "Input nilai {$request->jenis_nilai} untuk siswa ID {$request->siswa_id}",
            $request->ip()
        );

        return $this->createdResponse(
            $nilai->load(['siswa', 'kelas', 'mataPelajaran', 'guru']),
            'Nilai berhasil ditambahkan'
        );
    }

    /**
     * GET /api/nilai/{nilai}
     */
    public function show(Request $request, Nilai $nilai): JsonResponse
    {
        $user = $request->user();

        // Siswa hanya bisa lihat nilai miliknya
        if ($user->isSiswa()) {
            $siswa = $user->siswa;
            if ($siswa && $nilai->siswa_id !== $siswa->id) {
                return $this->forbiddenResponse('Anda tidak memiliki akses ke nilai ini.');
            }
        }

        return $this->successResponse(
            $nilai->load(['siswa', 'kelas', 'mataPelajaran', 'guru']),
            'Detail Data Nilai'
        );
    }

    /**
     * PUT /api/nilai/{nilai}
     * Hanya admin + guru
     */
    public function update(Request $request, Nilai $nilai): JsonResponse
    {
        $user = $request->user();

        if ($user->isGuru()) {
            $guru = $user->guru;
            if (! $guru || $nilai->guru_id !== $guru->id) {
                return $this->forbiddenResponse('Anda tidak memiliki akses untuk mengubah nilai ini.');
            }
        }

        $request->validate([
            'jenis_nilai' => self::JENIS_NILAI,
            'nilai'       => 'required|numeric|min:0|max:100',
            'keterangan'  => 'nullable|string',
        ]);

        $nilai->update($request->only(['jenis_nilai', 'nilai', 'keterangan']));

        ActivityLog::catat(
            $user,
            'update_nilai',
            $nilai,
            "Mengubah nilai ID {$nilai->id} — jenis: {$nilai->jenis_nilai}",
            $request->ip()
        );

        return $this->successResponse(
            $nilai->load(['siswa', 'kelas', 'mataPelajaran', 'guru']),
            'Nilai berhasil diperbarui'
        );
    }

    /**
     * DELETE /api/nilai/{nilai}
     * Hanya admin + guru
     */
    public function destroy(Request $request, Nilai $nilai): JsonResponse
    {
        $user = $request->user();

        if ($user->isGuru()) {
            $guru = $user->guru;
            if (! $guru || $nilai->guru_id !== $guru->id) {
                return $this->forbiddenResponse('Anda tidak memiliki akses untuk menghapus nilai ini.');
            }
        }

        $nilai->delete();

        ActivityLog::catat(
            $user,
            'delete_nilai',
            $nilai,
            "Menghapus nilai ID {$nilai->id}",
            $request->ip()
        );

        return $this->successResponse(null, 'Nilai berhasil dihapus');
    }
}
