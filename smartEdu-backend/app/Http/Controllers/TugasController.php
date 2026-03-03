<?php

namespace App\Http\Controllers;

use App\Models\Tugas;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TugasController extends Controller
{
    /**
     * GET /api/tugas
     * Admin: semua tugas.
     * Guru: hanya tugas miliknya.
     * Siswa: tugas untuk kelasnya.
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Tugas::with(['guru', 'kelas', 'mataPelajaran']);

        if ($user->isGuru()) {
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $query->where('guru_id', $guru->id);
        } elseif ($user->isSiswa()) {
            $siswa = $user->siswa;
            abort_unless($siswa && $siswa->kelas_id, 403, 'Profil siswa / kelas tidak ditemukan.');
            $query->where('kelas_id', $siswa->kelas_id);
        }
        // admin: tidak ada filter tambahan → lihat semua

        // Filter opsional
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->filled('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }
        if ($request->filled('search')) {
            $query->where('judul', 'like', "%{$request->search}%");
        }

        $tugas = $query->orderBy('tanggal_deadline')->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar tugas berhasil diambil',
            'data'    => $tugas->items(),
            'meta'    => [
                'current_page' => $tugas->currentPage(),
                'last_page'    => $tugas->lastPage(),
                'per_page'     => $tugas->perPage(),
                'total'        => $tugas->total(),
            ],
        ], 200);
    }

    /**
     * POST /api/tugas
     * Hanya admin dan guru.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'kelas_id'          => ['required', 'exists:kelas,id'],
            'mata_pelajaran_id' => ['required', 'exists:mata_pelajarans,id'],
            'judul'             => ['required', 'string', 'max:255'],
            'deskripsi'         => ['nullable', 'string'],
            'tanggal_diberikan' => ['required', 'date'],
            'tanggal_deadline'  => ['required', 'date', 'after_or_equal:tanggal_diberikan'],
            'semester'          => ['required', 'in:1,2'],
            'tahun_ajaran'      => ['required', 'string'],
            'status'            => ['sometimes', 'in:aktif,selesai'],
        ]);

        // Guru yang membuat tugas, guru_id otomatis dari profil guru
        $guruId = $user->isGuru()
            ? $user->guru->id
            : $request->validate(['guru_id' => 'required|exists:gurus,id'])['guru_id'];

        $tugas = Tugas::create(array_merge($validated, ['guru_id' => $guruId]));

        ActivityLog::catat(
            $user,
            'tambah_tugas',
            $tugas,
            "Menambahkan tugas: {$tugas->judul}",
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil ditambahkan',
            'data'    => $tugas->load(['guru', 'kelas', 'mataPelajaran']),
        ], 201);
    }

    /**
     * GET /api/tugas/{tugas}
     */
    public function show(Tugas $tugas): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $tugas->load(['guru', 'kelas', 'mataPelajaran', 'nilais']),
        ], 200);
    }

    /**
     * PUT /api/tugas/{tugas}
     * Admin atau guru pemilik tugas.
     */
    public function update(Request $request, Tugas $tugas): JsonResponse
    {
        $user = $request->user();

        // Guru hanya bisa update tugas miliknya
        if ($user->isGuru() && $tugas->guru_id !== $user->guru?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengubah tugas ini.',
            ], 403);
        }

        $validated = $request->validate([
            'kelas_id'          => ['sometimes', 'exists:kelas,id'],
            'mata_pelajaran_id' => ['sometimes', 'exists:mata_pelajarans,id'],
            'judul'             => ['sometimes', 'string', 'max:255'],
            'deskripsi'         => ['nullable', 'string'],
            'tanggal_diberikan' => ['sometimes', 'date'],
            'tanggal_deadline'  => ['sometimes', 'date', 'after_or_equal:tanggal_diberikan'],
            'semester'          => ['sometimes', 'in:1,2'],
            'tahun_ajaran'      => ['sometimes', 'string'],
            'status'            => ['sometimes', 'in:aktif,selesai'],
        ]);

        $tugas->update($validated);

        ActivityLog::catat(
            $user,
            'update_tugas',
            $tugas,
            "Mengubah tugas: {$tugas->judul}",
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil diperbarui',
            'data'    => $tugas->load(['guru', 'kelas', 'mataPelajaran']),
        ], 200);
    }

    /**
     * DELETE /api/tugas/{tugas}
     * Admin atau guru pemilik.
     */
    public function destroy(Request $request, Tugas $tugas): JsonResponse
    {
        $user = $request->user();

        if ($user->isGuru() && $tugas->guru_id !== $user->guru?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk menghapus tugas ini.',
            ], 403);
        }

        ActivityLog::catat(
            $user,
            'hapus_tugas',
            $tugas,
            "Menghapus tugas: {$tugas->judul}",
            $request->ip()
        );

        $tugas->delete(); // SoftDelete

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dihapus',
        ], 200);
    }
}
