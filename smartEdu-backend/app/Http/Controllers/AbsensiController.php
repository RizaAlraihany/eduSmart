<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use Illuminate\Http\Request;

class AbsensiController extends Controller
{
    public function index(Request $request)
    {
        $query = Absensi::with(['siswa', 'kelas', 'jadwal.mataPelajaran', 'guru']);

        // Filter by kelas
        if ($request->has('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }

        // Filter by siswa
        if ($request->has('siswa_id')) {
            $query->where('siswa_id', $request->siswa_id);
        }

        // Filter by tanggal
        if ($request->has('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        // Filter by date range
        if ($request->has('tanggal_mulai') && $request->has('tanggal_selesai')) {
            $query->whereBetween('tanggal', [$request->tanggal_mulai, $request->tanggal_selesai]);
        }

        $absensis = $query->latest('tanggal')->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Data Absensi berhasil diambil',
            'data' => $absensis->items(),
            'meta' => [
                'current_page' => $absensis->currentPage(),
                'last_page' => $absensis->lastPage(),
                'per_page' => $absensis->perPage(),
                'total' => $absensis->total(),
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswas,id',
            'kelas_id' => 'required|exists:kelas,id',
            'jadwal_id' => 'required|exists:jadwals,id',
            'guru_id' => 'required|exists:gurus,id',
            'tanggal' => 'required|date',
            'status_kehadiran' => 'required|in:hadir,sakit,izin,alpa',
            'keterangan' => 'nullable|string',
        ]);

        $absensi = Absensi::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil ditambahkan',
            'data' => $absensi->load(['siswa', 'kelas', 'jadwal', 'guru'])
        ], 201);
    }

    public function show(Absensi $absensi)
    {
        $absensi->load(['siswa', 'kelas', 'jadwal.mataPelajaran', 'guru']);

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Absensi',
            'data' => $absensi
        ], 200);
    }

    public function update(Request $request, Absensi $absensi)
    {
        $request->validate([
            'status_kehadiran' => 'required|in:hadir,sakit,izin,alpa',
            'keterangan' => 'nullable|string',
        ]);

        $absensi->update($request->only(['status_kehadiran', 'keterangan']));

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil diperbarui',
            'data' => $absensi
        ], 200);
    }

    public function destroy(Absensi $absensi)
    {
        $absensi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data Absensi berhasil dihapus'
        ], 200);
    }
}
