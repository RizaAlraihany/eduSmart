<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class KelasController extends Controller
{
    /**
     * GET /api/kelas
     */
    public function index(Request $request): JsonResponse
    {
        $query = Kelas::with(['waliKelas', 'siswas']);

        if ($request->filled('tingkat')) {
            $query->where('tingkat', $request->tingkat);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }

        if ($request->filled('search')) {
            $query->where('nama_kelas', 'like', "%{$request->search}%");
        }

        $kelas = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar Data Kelas',
            'data'    => $kelas->items(),
            'meta'    => [
                'current_page' => $kelas->currentPage(),
                'last_page'    => $kelas->lastPage(),
                'per_page'     => $kelas->perPage(),
                'total'        => $kelas->total(),
            ],
        ], 200);
    }

    /**
     * POST /api/kelas
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nama_kelas'    => 'required|string|max:255|unique:kelas,nama_kelas',
            'tingkat'       => 'required|in:X,XI,XII',
            'tahun_ajaran'  => 'required|string|max:20',
            'wali_kelas_id' => 'nullable|exists:gurus,id',
            'kapasitas'     => 'required|integer|min:1|max:50',
            'status'        => 'required|in:aktif,nonaktif',
        ]);

        try {
            $kelas = Kelas::create([
                'nama_kelas'    => $request->nama_kelas,
                'tingkat'       => $request->tingkat,
                'tahun_ajaran'  => $request->tahun_ajaran,
                'wali_kelas_id' => $request->wali_kelas_id,
                'kapasitas'     => $request->kapasitas,
                'status'        => $request->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data Kelas berhasil ditambahkan',
                'data'    => $kelas->load('waliKelas'),
            ], 201);
        } catch (\Throwable $e) {
            Log::error('[KelasController@store] Gagal menyimpan data kelas', [
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * GET /api/kelas/{kelas}
     *
     * Catatan: parameter binding menggunakan $kelas (bukan $kela)
     * sesuai nama resource di Route::apiResource('/kelas', ...).
     * Laravel otomatis resolve model Kelas via route model binding.
     */
    public function show(Kelas $kela): JsonResponse
    {
        $kela->load(['waliKelas', 'siswas', 'jadwals.mataPelajaran', 'jadwals.guru']);

        return response()->json([
            'success'    => true,
            'message'    => 'Detail Data Kelas',
            'data'       => $kela,
            'statistics' => [
                'total_siswa'       => $kela->siswas->count(),
                'kapasitas_tersisa' => $kela->kapasitas - $kela->siswas->count(),
                'total_jadwal'      => $kela->jadwals->count(),
            ],
        ], 200);
    }

    /**
     * PUT /api/kelas/{kelas}
     */
    public function update(Request $request, Kelas $kela): JsonResponse
    {
        $request->validate([
            'nama_kelas'    => ['required', 'string', 'max:255', Rule::unique('kelas', 'nama_kelas')->ignore($kela->id)],
            'tingkat'       => 'required|in:X,XI,XII',
            'tahun_ajaran'  => 'required|string|max:20',
            'wali_kelas_id' => 'nullable|exists:gurus,id',
            'kapasitas'     => 'required|integer|min:1|max:50',
            'status'        => 'required|in:aktif,nonaktif',
        ]);

        try {
            $kela->update([
                'nama_kelas'    => $request->nama_kelas,
                'tingkat'       => $request->tingkat,
                'tahun_ajaran'  => $request->tahun_ajaran,
                'wali_kelas_id' => $request->wali_kelas_id,
                'kapasitas'     => $request->kapasitas,
                'status'        => $request->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data kelas berhasil diperbarui',
                'data'    => $kela->load('waliKelas'),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('[KelasController@update] Gagal memperbarui data kelas', [
                'kelas_id' => $kela->id,
                'error'    => $e->getMessage(),
                'file'     => $e->getFile(),
                'line'     => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * DELETE /api/kelas/{kelas}
     * Guard: tidak bisa hapus kelas yang masih punya siswa aktif.
     */
    public function destroy(Kelas $kela): JsonResponse
    {
        // ── Business rule guard — bukan exception, return 422 ─────────────────
        if ($kela->siswas()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus kelas yang masih memiliki siswa.',
            ], 422);
        }

        try {
            $kela->delete();

            return response()->json([
                'success' => true,
                'message' => 'Data Kelas berhasil dihapus',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('[KelasController@destroy] Gagal menghapus data kelas', [
                'kelas_id' => $kela->id,
                'error'    => $e->getMessage(),
                'file'     => $e->getFile(),
                'line'     => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
            ], 500);
        }
    }
}
