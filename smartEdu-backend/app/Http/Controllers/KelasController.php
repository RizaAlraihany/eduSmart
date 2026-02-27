<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use Illuminate\Http\Request;

class KelasController extends Controller
{
    public function index(Request $request)
    {
        $query = Kelas::with(['waliKelas', 'siswas']);

        // Filter by tingkat
        if ($request->has('tingkat')) {
            $query->where('tingkat', $request->tingkat);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by tahun ajaran
        if ($request->has('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama_kelas', 'like', "%{$search}%");
        }

        $kelas = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar Data Kelas',
            'data' => $kelas->items(),
            'meta' => [
                'current_page' => $kelas->currentPage(),
                'last_page' => $kelas->lastPage(),
                'per_page' => $kelas->perPage(),
                'total' => $kelas->total(),
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_kelas' => 'required|string|max:255|unique:kelas,nama_kelas',
            'tingkat' => 'required|in:X,XI,XII',
            'tahun_ajaran' => 'required|string|max:20',
            'wali_kelas_id' => 'nullable|exists:gurus,id',
            'kapasitas' => 'required|integer|min:1|max:50',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        $kelas = Kelas::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data Kelas berhasil ditambahkan',
            'data' => $kelas->load('waliKelas')
        ], 201);
    }

    public function show(Kelas $kela) // Menggunakan $kela sesuai parameter asli Laravel Anda
    {
        $kela->load(['waliKelas', 'siswas', 'jadwals']);

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Kelas',
            'data' => $kela,
            'statistics' => [
                'total_siswa' => $kela->siswas()->count(),
                'kapasitas_tersisa' => $kela->kapasitas - $kela->siswas()->count(),
                'total_jadwal' => $kela->jadwals()->count(),
            ]
        ], 200);
    }

    public function update(Request $request, Kelas $kela)
    {
        $request->validate([
            'nama_kelas' => 'required|string|max:255|unique:kelas,nama_kelas,' . $kela->id,
            'tingkat' => 'required|in:X,XI,XII',
            'tahun_ajaran' => 'required|string|max:20',
            'wali_kelas_id' => 'nullable|exists:gurus,id',
            'kapasitas' => 'required|integer|min:1|max:50',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        $kela->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data kelas berhasil diperbarui',
            'data' => $kela->load('waliKelas')
        ], 200);
    }

    public function destroy(Kelas $kela)
    {
        // Check if kelas has students
        if ($kela->siswas()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus kelas yang masih memiliki siswa'
            ], 422);
        }

        $kela->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data Kelas berhasil dihapus'
        ], 200);
    }
}
