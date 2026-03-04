<?php

namespace App\Http\Controllers;

use App\Models\Pengumuman;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PengumumanController extends Controller
{
    /**
     * GET /api/pengumuman
     */
    public function index(Request $request): JsonResponse
    {
        $query = Pengumuman::with('pembuatPengumuman');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('tipe')) {
            $query->where('tipe', $request->tipe);
        }
        if ($request->has('aktif') && $request->aktif) {
            $query->where('status', 'aktif')
                ->where('tanggal_mulai', '<=', now())
                ->where('tanggal_selesai', '>=', now());
        }

        $pengumuman = $query->latest()->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($pengumuman, 'Daftar Pengumuman');
    }

    /**
     * POST /api/pengumuman
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'judul'           => 'required|string|max:255',
            'isi'             => 'required|string',
            'tipe'            => 'required|in:penting,biasa,urgent',
            'target_audience' => 'required|in:semua,guru,siswa,kelas_tertentu',
            'tanggal_mulai'   => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'status'          => 'required|in:draft,aktif,nonaktif',
        ]);

        $data               = $request->all();
        $data['dibuat_oleh'] = $request->user()->id;

        $pengumuman = Pengumuman::create($data);

        return $this->createdResponse($pengumuman, 'Pengumuman berhasil ditambahkan');
    }

    /**
     * GET /api/pengumuman/{pengumuman}
     */
    public function show(Pengumuman $pengumuman): JsonResponse
    {
        $pengumuman->load('pembuatPengumuman');

        return $this->successResponse($pengumuman, 'Detail Pengumuman');
    }

    /**
     * PUT /api/pengumuman/{pengumuman}
     */
    public function update(Request $request, Pengumuman $pengumuman): JsonResponse
    {
        if (! $request->user()->isAdmin() && $pengumuman->dibuat_oleh !== $request->user()->id) {
            return $this->forbiddenResponse('Anda tidak memiliki akses untuk mengubah pengumuman ini.');
        }

        $request->validate([
            'judul'           => 'sometimes|string|max:255',
            'isi'             => 'sometimes|string',
            'tipe'            => 'sometimes|in:penting,biasa,urgent',
            'target_audience' => 'sometimes|in:semua,guru,siswa,kelas_tertentu',
            'tanggal_mulai'   => 'sometimes|date',
            'tanggal_selesai' => 'sometimes|date|after_or_equal:tanggal_mulai',
            'status'          => 'sometimes|in:draft,aktif,nonaktif',
        ]);

        $pengumuman->update($request->all());

        return $this->successResponse($pengumuman, 'Pengumuman berhasil diperbarui');
    }

    /**
     * DELETE /api/pengumuman/{pengumuman}
     */
    public function destroy(Request $request, Pengumuman $pengumuman): JsonResponse
    {
        if (! $request->user()->isAdmin() && $pengumuman->dibuat_oleh !== $request->user()->id) {
            return $this->forbiddenResponse('Anda tidak memiliki akses untuk menghapus pengumuman ini.');
        }

        $pengumuman->delete();

        return $this->successResponse(null, 'Pengumuman berhasil dihapus');
    }
}
