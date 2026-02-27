<?php

namespace App\Http\Controllers;

use App\Models\MataPelajaran;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MataPelajaranController extends Controller
{
    public function index(Request $request)
    {
        $query = MataPelajaran::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_mapel', 'like', "%{$search}%")
                    ->orWhere('kode_mapel', 'like', "%{$search}%");
            });
        }

        $mapelList = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar Mata Pelajaran',
            'data' => $mapelList->items(),
            'meta' => [
                'current_page' => $mapelList->currentPage(),
                'last_page' => $mapelList->lastPage(),
                'per_page' => $mapelList->perPage(),
                'total' => $mapelList->total(),
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_mapel' => 'required|string|max:10|unique:mata_pelajarans,kode_mapel',
            'nama_mapel' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'kkm' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        $mataPelajaran = MataPelajaran::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Mata pelajaran berhasil ditambahkan',
            'data' => $mataPelajaran
        ], 201);
    }

    public function show(MataPelajaran $mataPelajaran)
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail Mata Pelajaran',
            'data' => $mataPelajaran,
            'statistics' => [
                'total_guru' => $mataPelajaran->gurus()->count(),
                'total_jadwal' => $mataPelajaran->jadwals()->count(),
            ]
        ], 200);
    }

    public function update(Request $request, MataPelajaran $mataPelajaran)
    {
        $request->validate([
            'kode_mapel' => ['required', 'string', 'max:10', Rule::unique('mata_pelajarans', 'kode_mapel')->ignore($mataPelajaran->id)],
            'nama_mapel' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'kkm' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        $mataPelajaran->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Mata pelajaran berhasil diperbarui',
            'data' => $mataPelajaran
        ], 200);
    }

    public function destroy(MataPelajaran $mataPelajaran)
    {
        // Check if mata pelajaran has jadwal
        if ($mataPelajaran->jadwals()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus mata pelajaran yang masih memiliki jadwal'
            ], 422);
        }

        $mataPelajaran->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mata pelajaran berhasil dihapus'
        ], 200);
    }
}
