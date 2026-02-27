<?php

namespace App\Http\Controllers;

use App\Models\Jadwal;
use Illuminate\Http\Request;

class JadwalController extends Controller
{
    public function index(Request $request)
    {
        $query = Jadwal::with(['kelas', 'mataPelajaran', 'guru']);

        // Filter by kelas
        if ($request->has('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }

        // Filter by guru
        if ($request->has('guru_id')) {
            $query->where('guru_id', $request->guru_id);
        }

        // Filter by hari
        if ($request->has('hari')) {
            $query->where('hari', $request->hari);
        }

        // Filter by semester
        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }

        // Filter by tahun ajaran
        if ($request->has('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }

        $jadwals = $query->orderBy('hari')->orderBy('jam_mulai')->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Data Jadwal berhasil diambil',
            'data' => $jadwals->items(),
            'meta' => [
                'current_page' => $jadwals->currentPage(),
                'last_page' => $jadwals->lastPage(),
                'per_page' => $jadwals->perPage(),
                'total' => $jadwals->total(),
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'guru_id' => 'required|exists:gurus,id',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'ruangan' => 'nullable|string|max:50',
            'semester' => 'required|in:1,2',
            'tahun_ajaran' => 'required|string|max:20',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        $jadwal = Jadwal::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil ditambahkan',
            'data' => $jadwal->load(['kelas', 'mataPelajaran', 'guru'])
        ], 201);
    }

    public function show(Jadwal $jadwal)
    {
        $jadwal->load(['kelas', 'mataPelajaran', 'guru']);

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Jadwal',
            'data' => $jadwal
        ], 200);
    }

    public function update(Request $request, Jadwal $jadwal)
    {
        $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'guru_id' => 'required|exists:gurus,id',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'ruangan' => 'nullable|string|max:50',
            'semester' => 'required|in:1,2',
            'tahun_ajaran' => 'required|string|max:20',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        $jadwal->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil diperbarui',
            'data' => $jadwal->load(['kelas', 'mataPelajaran', 'guru'])
        ], 200);
    }

    public function destroy(Jadwal $jadwal)
    {
        $jadwal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dihapus'
        ], 200);
    }
}
