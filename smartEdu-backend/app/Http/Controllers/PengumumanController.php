<?php

namespace App\Http\Controllers;

use App\Models\Pengumuman;
use Illuminate\Http\Request;

class PengumumanController extends Controller
{
    public function index(Request $request)
    {
        $query = Pengumuman::with('pembuatPengumuman');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by tipe
        if ($request->has('tipe')) {
            $query->where('tipe', $request->tipe);
        }

        // Filter aktif (between tanggal_mulai and tanggal_selesai)
        if ($request->has('aktif') && $request->aktif) {
            $query->where('status', 'aktif')
                ->where('tanggal_mulai', '<=', now())
                ->where('tanggal_selesai', '>=', now());
        }

        $pengumumen = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar Pengumuman',
            'data' => $pengumumen->items(),
            'meta' => [
                'current_page' => $pengumumen->currentPage(),
                'last_page' => $pengumumen->lastPage(),
                'per_page' => $pengumumen->perPage(),
                'total' => $pengumumen->total(),
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'tipe' => 'required|in:penting,biasa,urgent',
            'target_audience' => 'required|in:semua,guru,siswa,kelas_tertentu',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'status' => 'required|in:draft,aktif,nonaktif',
        ]);

        // Secara otomatis menyimpan ID pembuat berdasarkan user login
        $data = $request->all();
        $data['dibuat_oleh'] = $request->user()->id;

        $pengumuman = Pengumuman::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil ditambahkan',
            'data' => $pengumuman
        ], 201);
    }

    public function show(Pengumuman $pengumuman)
    {
        $pengumuman->load('pembuatPengumuman');

        return response()->json([
            'success' => true,
            'message' => 'Detail Pengumuman',
            'data' => $pengumuman
        ], 200);
    }

    public function update(Request $request, Pengumuman $pengumuman)
    {
        // Check authorization
        if (!$request->user()->isAdmin() && $pengumuman->dibuat_oleh !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengubah pengumuman ini'
            ], 403);
        }

        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'tipe' => 'required|in:penting,biasa,urgent',
            'target_audience' => 'required|in:semua,guru,siswa,kelas_tertentu',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'status' => 'required|in:draft,aktif,nonaktif',
        ]);

        $pengumuman->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil diperbarui',
            'data' => $pengumuman
        ], 200);
    }

    public function destroy(Request $request, Pengumuman $pengumuman)
    {
        // Check authorization
        if (!$request->user()->isAdmin() && $pengumuman->dibuat_oleh !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk menghapus pengumuman ini'
            ], 403);
        }

        $pengumuman->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil dihapus'
        ], 200);
    }
}
