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
     */
    public function index(Request $request): JsonResponse
    {
        $query = Pembayaran::with('siswa.kelas');
        $user  = $request->user();

        if ($user->isSiswa()) {
            $query->whereHas('siswa', fn($q) => $q->where('user_id', $user->id));
        } elseif ($request->filled('siswa_id')) {
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

        return $this->paginatedResponse($pembayarans, 'Daftar Data Pembayaran');
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

            return $this->createdResponse($pembayaran->load('siswa.kelas'), 'Pembayaran berhasil ditambahkan');
        } catch (\Throwable $e) {
            Log::error('[PembayaranController@store]', [
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
                'request' => $request->all(),
            ]);

            return $this->serverErrorResponse();
        }
    }

    /**
     * GET /api/pembayaran/{pembayaran}
     */
    public function show(Pembayaran $pembayaran): JsonResponse
    {
        return $this->successResponse($pembayaran->load('siswa.kelas'), 'Detail Data Pembayaran');
    }

    /**
     * PUT /api/pembayaran/{pembayaran}
     */
    public function update(Request $request, Pembayaran $pembayaran): JsonResponse
    {
        $request->validate([
            'status_pembayaran'  => 'required|in:belum_bayar,sudah_bayar,terlambat',
            'tanggal_pembayaran' => 'nullable|date',
            'metode_pembayaran'  => 'nullable|in:tunai,transfer,debit,kredit',
            'keterangan'         => 'nullable|string',
        ]);

        try {
            $pembayaran->update($request->only([
                'status_pembayaran',
                'tanggal_pembayaran',
                'metode_pembayaran',
                'keterangan',
            ]));

            return $this->successResponse($pembayaran->load('siswa.kelas'), 'Pembayaran berhasil diperbarui');
        } catch (\Throwable $e) {
            Log::error('[PembayaranController@update]', [
                'pembayaran_id' => $pembayaran->id,
                'error'         => $e->getMessage(),
                'line'          => $e->getLine(),
            ]);

            return $this->serverErrorResponse();
        }
    }

    /**
     * DELETE /api/pembayaran/{pembayaran}
     */
    public function destroy(Pembayaran $pembayaran): JsonResponse
    {
        try {
            $pembayaran->delete();

            return $this->successResponse(null, 'Pembayaran berhasil dihapus');
        } catch (\Throwable $e) {
            Log::error('[PembayaranController@destroy]', [
                'pembayaran_id' => $pembayaran->id,
                'error'         => $e->getMessage(),
                'line'          => $e->getLine(),
            ]);

            return $this->serverErrorResponse();
        }
    }
}
