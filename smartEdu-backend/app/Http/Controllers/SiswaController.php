<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class SiswaController extends Controller
{
    /**
     * GET /api/siswa
     */
    public function index(Request $request): JsonResponse
    {
        $query = Siswa::with(['user', 'kelas']);

        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('jenis_kelamin')) {
            $query->where('jenis_kelamin', $request->jenis_kelamin);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $siswas = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar Data Siswa',
            'data'    => $siswas->items(),
            'meta'    => [
                'current_page' => $siswas->currentPage(),
                'last_page'    => $siswas->lastPage(),
                'per_page'     => $siswas->perPage(),
                'total'        => $siswas->total(),
            ],
        ], 200);
    }

    /**
     * POST /api/siswa
     * Buat akun User + profil Siswa dalam satu transaksi.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nama'              => 'required|string|max:255',
            'nisn'              => 'required|string|unique:siswas,nisn',
            'email'             => 'required|email|unique:users,email|unique:siswas,email',
            'password'          => 'required|string|min:8',
            'kelas_id'          => 'required|exists:kelas,id',
            'jenis_kelamin'     => 'required|in:L,P',
            'tanggal_lahir'     => 'required|date',
            'telepon'           => 'nullable|string|max:20',
            'alamat'            => 'nullable|string',
            'nama_orang_tua'    => 'nullable|string|max:255',
            'telepon_orang_tua' => 'nullable|string|max:20',
            'status'            => 'required|in:aktif,nonaktif,lulus,pindah',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name'     => $request->nama,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'siswa',
            ]);

            $siswa = Siswa::create([
                'user_id'           => $user->id,
                'kelas_id'          => $request->kelas_id,
                'nisn'              => $request->nisn,
                'nama'              => $request->nama,
                'email'             => $request->email,
                'jenis_kelamin'     => $request->jenis_kelamin,
                'tanggal_lahir'     => $request->tanggal_lahir,
                'telepon'           => $request->telepon,
                'alamat'            => $request->alamat,
                'nama_orang_tua'    => $request->nama_orang_tua,
                'telepon_orang_tua' => $request->telepon_orang_tua,
                'status'            => $request->status,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data siswa berhasil ditambahkan',
                'data'    => $siswa->load(['user', 'kelas']),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('[SiswaController@store] Gagal menyimpan data siswa', [
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'request' => $request->except(['password']),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * GET /api/siswa/{siswa}
     */
    public function show(Siswa $siswa): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail Data Siswa',
            'data'    => $siswa->load(['user', 'kelas']),
        ], 200);
    }

    /**
     * PUT /api/siswa/{siswa}
     */
    public function update(Request $request, Siswa $siswa): JsonResponse
    {
        $request->validate([
            'nama'              => 'required|string|max:255',
            'email'             => ['required', 'email', Rule::unique('siswas')->ignore($siswa->id)],
            'kelas_id'          => 'required|exists:kelas,id',
            'jenis_kelamin'     => 'required|in:L,P',
            'tanggal_lahir'     => 'required|date',
            'telepon'           => 'nullable|string|max:20',
            'alamat'            => 'nullable|string',
            'nama_orang_tua'    => 'nullable|string|max:255',
            'telepon_orang_tua' => 'nullable|string|max:20',
            'status'            => 'required|in:aktif,nonaktif,lulus,pindah',
        ]);

        DB::beginTransaction();
        try {
            $siswa->update([
                'nama'              => $request->nama,
                'email'             => $request->email,
                'kelas_id'          => $request->kelas_id,
                'jenis_kelamin'     => $request->jenis_kelamin,
                'tanggal_lahir'     => $request->tanggal_lahir,
                'telepon'           => $request->telepon,
                'alamat'            => $request->alamat,
                'nama_orang_tua'    => $request->nama_orang_tua,
                'telepon_orang_tua' => $request->telepon_orang_tua,
                'status'            => $request->status,
            ]);

            if ($siswa->user) {
                $siswa->user->update([
                    'name'  => $request->nama,
                    'email' => $request->email,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data siswa berhasil diperbarui',
                'data'    => $siswa->load(['user', 'kelas']),
            ], 200);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('[SiswaController@update] Gagal memperbarui data siswa', [
                'siswa_id' => $siswa->id,
                'error'    => $e->getMessage(),
                'file'     => $e->getFile(),
                'line'     => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * DELETE /api/siswa/{siswa}
     * Hapus siswa beserta user account-nya.
     */
    public function destroy(Siswa $siswa): JsonResponse
    {
        DB::beginTransaction();
        try {
            $user = $siswa->user;
            $siswa->delete();

            if ($user) {
                $user->delete();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data siswa berhasil dihapus',
            ], 200);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('[SiswaController@destroy] Gagal menghapus data siswa', [
                'siswa_id' => $siswa->id,
                'error'    => $e->getMessage(),
                'file'     => $e->getFile(),
                'line'     => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
            ], 500);
        }
    }
}
