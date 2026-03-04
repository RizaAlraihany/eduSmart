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

        return $this->paginatedResponse($kelas, 'Daftar Data Kelas');
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

            return $this->createdResponse($kelas->load('waliKelas'), 'Data Kelas berhasil ditambahkan');
        } catch (\Throwable $e) {
            Log::error('[KelasController@store]', [
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
                'request' => $request->all(),
            ]);

            return $this->serverErrorResponse();
        }
    }

    /**
     * GET /api/kelas/{kelas}
     */
    public function show(Kelas $kela): JsonResponse
    {
        $kela->load(['waliKelas', 'siswas', 'jadwals.mataPelajaran', 'jadwals.guru']);

        return $this->successResponse($kela, 'Detail Data Kelas', 200, [
            'total_siswa'       => $kela->siswas->count(),
            'kapasitas_tersisa' => $kela->kapasitas - $kela->siswas->count(),
            'total_jadwal'      => $kela->jadwals->count(),
        ]);
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

            return $this->successResponse($kela->load('waliKelas'), 'Data kelas berhasil diperbarui');
        } catch (\Throwable $e) {
            Log::error('[KelasController@update]', [
                'kelas_id' => $kela->id,
                'error'    => $e->getMessage(),
                'line'     => $e->getLine(),
            ]);

            return $this->serverErrorResponse();
        }
    }

    /**
     * DELETE /api/kelas/{kelas}
     * Guard: tidak bisa hapus kelas yang masih punya siswa aktif.
     */
    public function destroy(Kelas $kela): JsonResponse
    {
        if ($kela->siswas()->where('status', 'aktif')->exists()) {
            return $this->unprocessableResponse(
                'Tidak dapat menghapus kelas yang masih memiliki siswa aktif.'
            );
        }

        try {
            $kela->delete();

            return $this->successResponse(null, 'Data kelas berhasil dihapus');
        } catch (\Throwable $e) {
            Log::error('[KelasController@destroy]', [
                'kelas_id' => $kela->id,
                'error'    => $e->getMessage(),
                'line'     => $e->getLine(),
            ]);

            return $this->serverErrorResponse();
        }
    }
}
