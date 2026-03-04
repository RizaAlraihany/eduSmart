<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PembayaranController extends Controller
{
    /**
     * GET /api/pembayaran
     * Admin: bisa filter by siswa_id.
     * Siswa: hanya melihat pembayaran miliknya sendiri.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Pembayaran::with('siswa.kelas');

        $user = $request->user();

        if ($user->isSiswa()) {
            // Siswa hanya lihat pembayaran miliknya
            $query->whereHas('siswa', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($request->filled('siswa_id')) {
            // Admin boleh filter by siswa_id
            $query->where('siswa_id', $request->siswa_id);
        }

        if ($request->filled('status_pembayaran')) {
            $query->where('status_pembayaran', $request->status_pembayaran);
        }

        if ($request->filled('jenis_pembayaran')) {
            $query->where('jenis_pembayaran', $request->jenis_pembayaran);
        }

        if ($request->filled('bulan') && $request->filled('tahun')) {
            $query->whereMonth('tanggal_jatuh_tempo', $request->bulan)
                ->whereYear('tanggal_jatuh_tempo', $request->tahun);
        }

        $pembayarans = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar Data Pembayaran',
            'data'    => $pembayarans->items(),
            'meta'    => [
                'current_page' => $pembayarans->currentPage(),
                'last_page'    => $pembayarans->lastPage(),
                'per_page'     => $pembayarans->perPage(),
                'total'        => $pembayarans->total(),
            ],
        ], 200);
    }

    /**
     * POST /api/pembayaran
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'siswa_id'            => 'required|exists:siswas,id',
            'jenis_pembayaran'    => 'required|string|max:255',
            'jumlah'              => 'required|numeric|min:0',
            'tanggal_jatuh_tempo' => 'required|date',
            'keterangan'          => 'nullable|string',
            'status_pembayaran'   => 'required|in:belum_bayar,sudah_bayar,terlambat',
        ]);

        try {
            $pembayaran = Pembayaran::create([
                'siswa_id'            => $request->siswa_id,
                'jenis_pembayaran'    => $request->jenis_pembayaran,
                'jumlah'              => $request->jumlah,
                'tanggal_jatuh_tempo' => $request->tanggal_jatuh_tempo,
                'keterangan'          => $request->keterangan,
                'status_pembayaran'   => $request->status_pembayaran,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran berhasil ditambahkan',
                'data'    => $pembayaran->load('siswa.kelas'),
            ], 201);
        } catch (\Throwable $e) {
            Log::error('[PembayaranController@store] Gagal menyimpan data pembayaran', [
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * GET /api/pembayaran/{pembayaran}
     */
    public function show(Pembayaran $pembayaran): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail Data Pembayaran',
            'data'    => $pembayaran->load('siswa.kelas'),
        ], 200);
    }

    /**
     * PUT /api/pembayaran/{pembayaran}
     * Update status & detail pembayaran.
     */
    public function update(Request $request, Pembayaran $pembayaran): JsonResponse
    {
        $request->validate([
            'status_pembayaran'   => 'required|in:belum_bayar,sudah_bayar,terlambat',
            'tanggal_pembayaran'  => 'nullable|date',
            'metode_pembayaran'   => 'nullable|in:tunai,transfer,debit,kredit',
            'keterangan'          => 'nullable|string',
        ]);

        try {
            $pembayaran->update($request->only([
                'status_pembayaran',
                'tanggal_pembayaran',
                'metode_pembayaran',
                'keterangan',
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran berhasil diperbarui',
                'data'    => $pembayaran->load('siswa.kelas'),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('[PembayaranController@update] Gagal memperbarui data pembayaran', [
                'pembayaran_id' => $pembayaran->id,
                'error'         => $e->getMessage(),
                'file'          => $e->getFile(),
                'line'          => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * DELETE /api/pembayaran/{pembayaran}
     */
    public function destroy(Pembayaran $pembayaran): JsonResponse
    {
        try {
            $pembayaran->delete();

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran berhasil dihapus',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('[PembayaranController@destroy] Gagal menghapus data pembayaran', [
                'pembayaran_id' => $pembayaran->id,
                'error'         => $e->getMessage(),
                'file'          => $e->getFile(),
                'line'          => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
            ], 500);
        }
    }
}
