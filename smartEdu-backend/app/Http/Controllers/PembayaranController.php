<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use Illuminate\Http\Request;

class PembayaranController extends Controller
{
    public function index(Request $request)
    {
        $query = Pembayaran::with('siswa');

        // Filter by siswa (if not admin/guru, filter by current user)
        if ($request->user() && method_exists($request->user(), 'isSiswa') && $request->user()->isSiswa()) {
            $query->whereHas('siswa', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });
        } elseif ($request->has('siswa_id')) {
            $query->where('siswa_id', $request->siswa_id);
        }

        // Filter by status
        if ($request->has('status_pembayaran')) {
            $query->where('status_pembayaran', $request->status_pembayaran);
        }

        // Filter by jenis
        if ($request->has('jenis_pembayaran')) {
            $query->where('jenis_pembayaran', $request->jenis_pembayaran);
        }

        $pembayarans = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar Data Pembayaran',
            'data' => $pembayarans->items(),
            'meta' => [
                'current_page' => $pembayarans->currentPage(),
                'last_page' => $pembayarans->lastPage(),
                'per_page' => $pembayarans->perPage(),
                'total' => $pembayarans->total(),
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswas,id',
            'jenis_pembayaran' => 'required|string|max:255',
            'jumlah' => 'required|numeric|min:0',
            'tanggal_jatuh_tempo' => 'required|date',
            'keterangan' => 'nullable|string',
            'status_pembayaran' => 'required|in:belum_bayar,sudah_bayar,terlambat'
        ]);

        $pembayaran = Pembayaran::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil ditambahkan',
            'data' => $pembayaran->load('siswa')
        ], 201);
    }

    public function show(Pembayaran $pembayaran)
    {
        $pembayaran->load('siswa.kelas');

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Pembayaran',
            'data' => $pembayaran
        ], 200);
    }

    public function update(Request $request, Pembayaran $pembayaran)
    {
        $request->validate([
            'status_pembayaran' => 'required|in:belum_bayar,sudah_bayar,terlambat',
            'tanggal_pembayaran' => 'nullable|date',
            'metode_pembayaran' => 'nullable|in:tunai,transfer,debit,kredit',
            'keterangan' => 'nullable|string',
        ]);

        $pembayaran->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil diperbarui',
            'data' => $pembayaran
        ], 200);
    }

    public function destroy(Pembayaran $pembayaran)
    {
        $pembayaran->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dihapus'
        ], 200);
    }
}
