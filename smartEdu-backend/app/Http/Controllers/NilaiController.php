<?php

namespace App\Http\Controllers;

use App\Models\Nilai;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NilaiController extends Controller
{
    /**
     * GET /api/nilai
     * Admin: semua nilai.
     * Guru: hanya nilai yang dia input (guru_id miliknya).
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Nilai::with(['siswa', 'kelas', 'mataPelajaran', 'guru']);

        // Guru hanya lihat nilai yang dia input
        if ($user->isGuru()) {
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $query->where('guru_id', $guru->id);
        }

        if ($request->filled('siswa_id')) {
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

        return response()->json([
            'success' => true,
            'message' => 'Daftar Data Nilai',
            'data'    => $nilais->items(),
            'meta'    => [
                'current_page' => $nilais->currentPage(),
                'last_page'    => $nilais->lastPage(),
                'per_page'     => $nilais->perPage(),
                'total'        => $nilais->total(),
            ],
        ], 200);
    }

    /**
     * POST /api/nilai
     * Guru input nilai — guru_id di-force dari profil guru yang login,
     * bukan dari request body, mencegah guru menginput atas nama guru lain.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'siswa_id'         => 'required|exists:siswas,id',
            'kelas_id'         => 'required|exists:kelas,id',
            'mata_pelajaran_id'=> 'required|exists:mata_pelajarans,id',
            'jenis_nilai'      => 'required|in:tugas,uts,uas,praktek,harian',
            'nilai'            => 'required|numeric|min:0|max:100',
            'semester'         => 'required|in:1,2',
            'tahun_ajaran'     => 'required|string|max:20',
            'keterangan'       => 'nullable|string',
        ]);

        // Tentukan guru_id: jika admin boleh override via request,
        // jika guru → paksa dari profil sendiri
        if ($user->isGuru()) {
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $guruId = $guru->id;
        } else {
            // Admin boleh input atas nama guru manapun
            $request->validate([
                'guru_id' => 'required|exists:gurus,id',
            ]);
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

        return response()->json([
            'success' => true,
            'message' => 'Nilai berhasil ditambahkan',
            'data'    => $nilai->load(['siswa', 'kelas', 'mataPelajaran', 'guru']),
        ], 201);
    }

    /**
     * GET /api/nilai/{nilai}
     */
    public function show(Nilai $nilai): JsonResponse
    {
        $nilai->load(['siswa', 'kelas', 'mataPelajaran', 'guru']);

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Nilai',
            'data'    => $nilai,
        ], 200);
    }

    /**
     * PUT /api/nilai/{nilai}
     *
     * IDOR FIX: Guru hanya bisa update nilai yang guru_id-nya cocok dengan
     * profil guru yang sedang login. Admin bypass semua pengecekan ini.
     */
    public function update(Request $request, Nilai $nilai): JsonResponse
    {
        $user = $request->user();

        // ── Ownership check ───────────────────────────────────────────────────
        if ($user->isGuru()) {
            $guru = $user->guru;

            if (! $guru || $nilai->guru_id !== $guru->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden. Anda tidak memiliki akses untuk mengubah nilai ini.',
                ], 403);
            }
        }
        // Admin: tidak ada pengecekan ownership, boleh update semua

        $request->validate([
            'jenis_nilai' => 'required|in:tugas,uts,uas,praktek,harian',
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

        return response()->json([
            'success' => true,
            'message' => 'Nilai berhasil diperbarui',
            'data'    => $nilai->load(['siswa', 'kelas', 'mataPelajaran', 'guru']),
        ], 200);
    }

    /**
     * DELETE /api/nilai/{nilai}
     *
     * IDOR FIX: Guru hanya bisa hapus nilai miliknya sendiri.
     */
    public function destroy(Request $request, Nilai $nilai): JsonResponse
    {
        $user = $request->user();

        // ── Ownership check ───────────────────────────────────────────────────
        if ($user->isGuru()) {
            $guru = $user->guru;

            if (! $guru || $nilai->guru_id !== $guru->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden. Anda tidak memiliki akses untuk menghapus nilai ini.',
                ], 403);
            }
        }

        ActivityLog::catat(
            $user,
            'hapus_nilai',
            $nilai,
            "Menghapus nilai ID {$nilai->id} — siswa ID {$nilai->siswa_id}",
            $request->ip()
        );

        $nilai->delete();

        return response()->json([
            'success' => true,
            'message' => 'Nilai berhasil dihapus',
        ], 200);
    }
}