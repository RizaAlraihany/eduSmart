<?php

namespace App\Http\Controllers;

use App\Models\Jadwal;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JadwalController extends Controller
{
    /**
     * GET /api/jadwal
     * Admin: semua jadwal.
     * Guru: hanya jadwal miliknya.
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Jadwal::with(['kelas', 'mataPelajaran', 'guru']);

        // Guru hanya lihat jadwal miliknya
        if ($user->isGuru()) {
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $query->where('guru_id', $guru->id);
        }

        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }
        if ($request->filled('guru_id') && $user->isAdmin()) {
            // Hanya admin yang boleh filter by guru_id arbitrary
            $query->where('guru_id', $request->guru_id);
        }
        if ($request->filled('hari')) {
            $query->where('hari', $request->hari);
        }
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->filled('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $jadwals = $query
            ->orderBy('hari')
            ->orderBy('jam_mulai')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Data Jadwal berhasil diambil',
            'data'    => $jadwals->items(),
            'meta'    => [
                'current_page' => $jadwals->currentPage(),
                'last_page'    => $jadwals->lastPage(),
                'per_page'     => $jadwals->perPage(),
                'total'        => $jadwals->total(),
            ],
        ], 200);
    }

    /**
     * POST /api/jadwal
     * Hanya admin yang membuat jadwal (assign guru ke slot).
     * Jika guru POST, guru_id di-force dari profil sendiri.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'kelas_id'          => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'hari'              => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai'         => 'required|date_format:H:i',
            'jam_selesai'       => 'required|date_format:H:i|after:jam_mulai',
            'ruangan'           => 'nullable|string|max:50',
            'semester'          => 'required|in:1,2',
            'tahun_ajaran'      => 'required|string|max:20',
            'status'            => 'required|in:aktif,nonaktif',
        ]);

        // Force guru_id
        if ($user->isGuru()) {
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $guruId = $guru->id;
        } else {
            $request->validate([
                'guru_id' => 'required|exists:gurus,id',
            ]);
            $guruId = $request->guru_id;
        }

        $jadwal = Jadwal::create([
            'kelas_id'          => $request->kelas_id,
            'mata_pelajaran_id' => $request->mata_pelajaran_id,
            'guru_id'           => $guruId,
            'hari'              => $request->hari,
            'jam_mulai'         => $request->jam_mulai,
            'jam_selesai'       => $request->jam_selesai,
            'ruangan'           => $request->ruangan,
            'semester'          => $request->semester,
            'tahun_ajaran'      => $request->tahun_ajaran,
            'status'            => $request->status,
        ]);

        ActivityLog::catat(
            $user,
            'tambah_jadwal',
            $jadwal,
            "Menambahkan jadwal {$request->hari} untuk kelas ID {$request->kelas_id}",
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil ditambahkan',
            'data'    => $jadwal->load(['kelas', 'mataPelajaran', 'guru']),
        ], 201);
    }

    /**
     * GET /api/jadwal/{jadwal}
     */
    public function show(Jadwal $jadwal): JsonResponse
    {
        $jadwal->load(['kelas', 'mataPelajaran', 'guru']);

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Jadwal',
            'data'    => $jadwal,
        ], 200);
    }

    /**
     * PUT /api/jadwal/{jadwal}
     *
     * IDOR FIX: Guru hanya bisa update jadwal yang guru_id-nya cocok
     * dengan profil guru yang sedang login.
     */
    public function update(Request $request, Jadwal $jadwal): JsonResponse
    {
        $user = $request->user();

        // ── Ownership check ───────────────────────────────────────────────────
        if ($user->isGuru()) {
            $guru = $user->guru;

            if (! $guru || $jadwal->guru_id !== $guru->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden. Anda tidak memiliki akses untuk mengubah jadwal ini.',
                ], 403);
            }
        }
        // Admin: bypass

        $request->validate([
            'kelas_id'          => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'guru_id'           => 'required|exists:gurus,id',
            'hari'              => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai'         => 'required|date_format:H:i',
            'jam_selesai'       => 'required|date_format:H:i|after:jam_mulai',
            'ruangan'           => 'nullable|string|max:50',
            'semester'          => 'required|in:1,2',
            'tahun_ajaran'      => 'required|string|max:20',
            'status'            => 'required|in:aktif,nonaktif',
        ]);

        // Guru tidak boleh reassign jadwal ke guru lain
        $updateData = $request->except(['guru_id']);
        if ($user->isAdmin()) {
            $updateData['guru_id'] = $request->guru_id;
        }

        $jadwal->update($updateData);

        ActivityLog::catat(
            $user,
            'update_jadwal',
            $jadwal,
            "Mengubah jadwal ID {$jadwal->id} — {$jadwal->hari} {$jadwal->jam_mulai}",
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil diperbarui',
            'data'    => $jadwal->load(['kelas', 'mataPelajaran', 'guru']),
        ], 200);
    }

    /**
     * DELETE /api/jadwal/{jadwal}
     *
     * IDOR FIX: Guru hanya bisa hapus jadwal miliknya sendiri.
     */
    public function destroy(Request $request, Jadwal $jadwal): JsonResponse
    {
        $user = $request->user();

        // ── Ownership check ───────────────────────────────────────────────────
        if ($user->isGuru()) {
            $guru = $user->guru;

            if (! $guru || $jadwal->guru_id !== $guru->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden. Anda tidak memiliki akses untuk menghapus jadwal ini.',
                ], 403);
            }
        }

        ActivityLog::catat(
            $user,
            'hapus_jadwal',
            $jadwal,
            "Menghapus jadwal ID {$jadwal->id} — {$jadwal->hari} kelas ID {$jadwal->kelas_id}",
            $request->ip()
        );

        $jadwal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dihapus',
        ], 200);
    }
}
