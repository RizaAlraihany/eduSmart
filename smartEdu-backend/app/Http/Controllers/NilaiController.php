<?php

namespace App\Http\Controllers;

use App\Models\Nilai;
use Illuminate\Http\Request;

class NilaiController extends Controller
{
    public function index(Request $request)
    {
        $query = Nilai::with(['siswa', 'kelas', 'mataPelajaran', 'guru']);

        // Filter by siswa
        if ($request->has('siswa_id')) {
            $query->where('siswa_id', $request->siswa_id);
        }

        // Filter by kelas
        if ($request->has('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }

        // Filter by mata pelajaran
        if ($request->has('mata_pelajaran_id')) {
            $query->where('mata_pelajaran_id', $request->mata_pelajaran_id);
        }

        // Filter by jenis nilai
        if ($request->has('jenis_nilai')) {
            $query->where('jenis_nilai', $request->jenis_nilai);
        }

        // Filter by semester
        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }

        // Filter by tahun ajaran
        if ($request->has('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }

        $nilais = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar Data Nilai',
            'data' => $nilais->items(),
            'meta' => [
                'current_page' => $nilais->currentPage(),
                'last_page' => $nilais->lastPage(),
                'per_page' => $nilais->perPage(),
                'total' => $nilais->total(),
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswas,id',
            'kelas_id' => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'guru_id' => 'required|exists:gurus,id',
            'jenis_nilai' => 'required|in:tugas,uts,uas,praktek,harian',
            'nilai' => 'required|numeric|min:0|max:100',
            'semester' => 'required|in:1,2',
            'tahun_ajaran' => 'required|string|max:20',
            'keterangan' => 'nullable|string',
        ]);

        $nilai = Nilai::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Nilai berhasil ditambahkan',
            'data' => $nilai->load(['siswa', 'kelas', 'mataPelajaran', 'guru'])
        ], 201);
    }

    public function show(Nilai $nilai)
    {
        $nilai->load(['siswa', 'kelas', 'mataPelajaran', 'guru']);

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Nilai',
            'data' => $nilai
        ], 200);
    }

    public function update(Request $request, Nilai $nilai)
    {
        $request->validate([
            'jenis_nilai' => 'required|in:tugas,uts,uas,praktek,harian',
            'nilai' => 'required|numeric|min:0|max:100',
            'keterangan' => 'nullable|string',
        ]);

        $nilai->update($request->only(['jenis_nilai', 'nilai', 'keterangan']));

        return response()->json([
            'success' => true,
            'message' => 'Nilai berhasil diperbarui',
            'data' => $nilai
        ], 200);
    }

    public function destroy(Nilai $nilai)
    {
        $nilai->delete();

        return response()->json([
            'success' => true,
            'message' => 'Nilai berhasil dihapus'
        ], 200);
    }
}
