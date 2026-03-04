<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AbsensiController extends Controller
{
    /**
     * GET /api/absensi
     * Admin: semua absensi.
     * Guru: hanya absensi yang dia catat (guru_id miliknya).
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Absensi::with(['siswa', 'kelas', 'jadwal.mataPelajaran', 'guru']);

        // Guru hanya lihat absensi yang dia catat
        if ($user->isGuru()) {
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $query->where('guru_id', $guru->id);
        }

        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }
        if ($request->filled('siswa_id')) {
            $query->where('siswa_id', $request->siswa_id);
        }
        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }
        if ($request->filled('tanggal_mulai') && $request->filled('tanggal_selesai')) {
            $query->whereBetween('tanggal', [
                $request->tanggal_mulai,
                $request->tanggal_selesai,
            ]);
        }

        $absensis = $query->latest('tanggal')->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Data Absensi berhasil diambil',
            'data'    => $absensis->items(),
            'meta'    => [
                'current_page' => $absensis->currentPage(),
                'last_page'    => $absensis->lastPage(),
                'per_page'     => $absensis->perPage(),
                'total'        => $absensis->total(),
            ],
        ], 200);
    }

    /**
     * POST /api/absensi
     * Guru mencatat absensi — guru_id di-force dari profil sendiri.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'siswa_id'         => 'required|exists:siswas,id',
            'kelas_id'         => 'required|exists:kelas,id',
            'jadwal_id'        => 'required|exists:jadwals,id',
            'tanggal'          => 'required|date',
            'status_kehadiran' => 'required|in:hadir,sakit,izin,alpa',
            'keterangan'       => 'nullable|string',
        ]);

        // Force guru_id dari profil yang login — jika admin, wajib kirim guru_id via body
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

        $absensi = Absensi::create([
            'siswa_id'         => $request->siswa_id,
            'kelas_id'         => $request->kelas_id,
            'jadwal_id'        => $request->jadwal_id,
            'guru_id'          => $guruId,
            'tanggal'          => $request->tanggal,
            'status_kehadiran' => $request->status_kehadiran,
            'keterangan'       => $request->keterangan,
        ]);

        ActivityLog::catat(
            $user,
            'input_absensi',
            $absensi,
            "Mencatat absensi siswa ID {$request->siswa_id} tanggal {$request->tanggal}",
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil ditambahkan',
            'data'    => $absensi->load(['siswa', 'kelas', 'jadwal', 'guru']),
        ], 201);
    }

    /**
     * GET /api/absensi/{absensi}
     */
    public function show(Absensi $absensi): JsonResponse
    {
        $absensi->load(['siswa', 'kelas', 'jadwal.mataPelajaran', 'guru']);

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Absensi',
            'data'    => $absensi,
        ], 200);
    }

    /**
     * PUT /api/absensi/{absensi}
     *
     * IDOR FIX: Guru hanya bisa update absensi yang guru_id-nya cocok
     * dengan profil guru yang sedang login.
     */
    public function update(Request $request, Absensi $absensi): JsonResponse
    {
        $user = $request->user();

        // Ownership check 
        if ($user->isGuru()) {
            $guru = $user->guru;

            if (! $guru || $absensi->guru_id !== $guru->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden. Anda tidak memiliki akses untuk mengubah absensi ini.',
                ], 403);
            }
        }
        // Admin: bypass, boleh update semua

        $request->validate([
            'status_kehadiran' => 'required|in:hadir,sakit,izin,alpa',
            'keterangan'       => 'nullable|string',
        ]);

        $absensi->update($request->only(['status_kehadiran', 'keterangan']));

        ActivityLog::catat(
            $user,
            'update_absensi',
            $absensi,
            "Mengubah absensi ID {$absensi->id} — status: {$absensi->status_kehadiran}",
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil diperbarui',
            'data'    => $absensi->load(['siswa', 'kelas', 'jadwal.mataPelajaran', 'guru']),
        ], 200);
    }

    /**
     * DELETE /api/absensi/{absensi}
     *
     * IDOR FIX: Guru hanya bisa hapus absensi yang guru_id-nya miliknya.
     */
    public function destroy(Request $request, Absensi $absensi): JsonResponse
    {
        $user = $request->user();

        // Ownership check 
        if ($user->isGuru()) {
            $guru = $user->guru;

            if (! $guru || $absensi->guru_id !== $guru->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden. Anda tidak memiliki akses untuk menghapus absensi ini.',
                ], 403);
            }
        }

        ActivityLog::catat(
            $user,
            'hapus_absensi',
            $absensi,
            "Menghapus absensi ID {$absensi->id} — siswa ID {$absensi->siswa_id}",
            $request->ip()
        );

        $absensi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data Absensi berhasil dihapus',
        ], 200);
    }
}
