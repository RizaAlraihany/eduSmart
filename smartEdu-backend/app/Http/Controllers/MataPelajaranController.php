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

        return $this->paginatedResponse($mapelList, 'Daftar Mata Pelajaran');
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

            return $this->createdResponse($mataPelajaran, 'Mata pelajaran berhasil ditambahkan');
        } catch (\Throwable $e) {
            Log::error('[MataPelajaranController@store]', [
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
                'request' => $request->all(),
            ]);

            return $this->serverErrorResponse();
        }
    }

    /**
     * GET /api/mapel/{mataPelajaran}
     */
    public function show(MataPelajaran $mataPelajaran): JsonResponse
    {
        return $this->successResponse($mataPelajaran, 'Detail Mata Pelajaran', 200, [
            'total_guru'   => $mataPelajaran->gurus()->count(),
            'total_jadwal' => $mataPelajaran->jadwals()->count(),
        ]);
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

            return $this->successResponse($mataPelajaran, 'Mata pelajaran berhasil diperbarui');
        } catch (\Throwable $e) {
            Log::error('[MataPelajaranController@update]', [
                'mapel_id' => $mataPelajaran->id,
                'error'    => $e->getMessage(),
                'line'     => $e->getLine(),
            ]);

            return $this->serverErrorResponse();
        }
    }

    /**
     * DELETE /api/mapel/{mataPelajaran}
     * Guard: tidak bisa hapus mapel yang masih terikat jadwal.
     */
    public function destroy(MataPelajaran $mataPelajaran): JsonResponse
    {
        if ($mataPelajaran->jadwals()->exists()) {
            return $this->unprocessableResponse(
                'Tidak dapat menghapus mata pelajaran yang masih memiliki jadwal.'
            );
        }

        try {
            $mataPelajaran->delete();

            return $this->successResponse(null, 'Mata pelajaran berhasil dihapus');
        } catch (\Throwable $e) {
            Log::error('[MataPelajaranController@destroy]', [
                'mapel_id' => $mataPelajaran->id,
                'error'    => $e->getMessage(),
                'line'     => $e->getLine(),
            ]);

            return $this->serverErrorResponse();
        }
    }
}
