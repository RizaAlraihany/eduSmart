<?php

namespace App\Http\Controllers;

use App\Models\MataPelajaran;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class MataPelajaranController extends Controller
{
    /**
     * GET /api/mapel
     */
    public function index(Request $request): JsonResponse
    {
        $query = MataPelajaran::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_mapel', 'like', "%{$search}%")
                    ->orWhere('kode_mapel', 'like', "%{$search}%");
            });
        }

        $mapelList = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar Mata Pelajaran',
            'data'    => $mapelList->items(),
            'meta'    => [
                'current_page' => $mapelList->currentPage(),
                'last_page'    => $mapelList->lastPage(),
                'per_page'     => $mapelList->perPage(),
                'total'        => $mapelList->total(),
            ],
        ], 200);
    }

    /**
     * POST /api/mapel
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'kode_mapel' => 'required|string|max:10|unique:mata_pelajarans,kode_mapel',
            'nama_mapel' => 'required|string|max:255',
            'deskripsi'  => 'nullable|string',
            'kkm'        => 'required|numeric|min:0|max:100',
            'status'     => 'required|in:aktif,nonaktif',
        ]);

        try {
            $mataPelajaran = MataPelajaran::create([
                'kode_mapel' => $request->kode_mapel,
                'nama_mapel' => $request->nama_mapel,
                'deskripsi'  => $request->deskripsi,
                'kkm'        => $request->kkm,
                'status'     => $request->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mata pelajaran berhasil ditambahkan',
                'data'    => $mataPelajaran,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('[MataPelajaranController@store] Gagal menyimpan mata pelajaran', [
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
     * GET /api/mapel/{mataPelajaran}
     */
    public function show(MataPelajaran $mataPelajaran): JsonResponse
    {
        return response()->json([
            'success'    => true,
            'message'    => 'Detail Mata Pelajaran',
            'data'       => $mataPelajaran,
            'statistics' => [
                'total_guru'   => $mataPelajaran->gurus()->count(),
                'total_jadwal' => $mataPelajaran->jadwals()->count(),
            ],
        ], 200);
    }

    /**
     * PUT /api/mapel/{mataPelajaran}
     */
    public function update(Request $request, MataPelajaran $mataPelajaran): JsonResponse
    {
        $request->validate([
            'kode_mapel' => ['required', 'string', 'max:10', Rule::unique('mata_pelajarans', 'kode_mapel')->ignore($mataPelajaran->id)],
            'nama_mapel' => 'required|string|max:255',
            'deskripsi'  => 'nullable|string',
            'kkm'        => 'required|numeric|min:0|max:100',
            'status'     => 'required|in:aktif,nonaktif',
        ]);

        try {
            $mataPelajaran->update([
                'kode_mapel' => $request->kode_mapel,
                'nama_mapel' => $request->nama_mapel,
                'deskripsi'  => $request->deskripsi,
                'kkm'        => $request->kkm,
                'status'     => $request->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mata pelajaran berhasil diperbarui',
                'data'    => $mataPelajaran,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('[MataPelajaranController@update] Gagal memperbarui mata pelajaran', [
                'mapel_id' => $mataPelajaran->id,
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
     * DELETE /api/mapel/{mataPelajaran}
     * Guard: tidak bisa hapus mapel yang masih terikat jadwal.
     */
    public function destroy(MataPelajaran $mataPelajaran): JsonResponse
    {
        // ── Business rule guard — bukan exception, return 422 ─────────────────
        if ($mataPelajaran->jadwals()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus mata pelajaran yang masih memiliki jadwal.',
            ], 422);
        }

        try {
            $mataPelajaran->delete();

            return response()->json([
                'success' => true,
                'message' => 'Mata pelajaran berhasil dihapus',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('[MataPelajaranController@destroy] Gagal menghapus mata pelajaran', [
                'mapel_id' => $mataPelajaran->id,
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
