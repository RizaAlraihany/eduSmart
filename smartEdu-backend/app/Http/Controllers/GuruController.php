<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class GuruController extends Controller
{
    /**
     * GET /api/guru
     * Daftar semua guru dengan filter & search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Guru::with('user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('jenis_kelamin')) {
            $query->where('jenis_kelamin', $request->jenis_kelamin);
        }

        if ($request->filled('pendidikan_terakhir')) {
            $query->where('pendidikan_terakhir', $request->pendidikan_terakhir);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $gurus = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar Data Guru',
            'data'    => $gurus->items(),
            'meta'    => [
                'current_page' => $gurus->currentPage(),
                'last_page'    => $gurus->lastPage(),
                'per_page'     => $gurus->perPage(),
                'total'        => $gurus->total(),
            ],
            'statistics' => [
                'total_guru'     => Guru::count(),
                'guru_aktif'     => Guru::where('status', 'aktif')->count(),
                'guru_laki'      => Guru::where('jenis_kelamin', 'L')->count(),
                'guru_perempuan' => Guru::where('jenis_kelamin', 'P')->count(),
            ],
        ], 200);
    }

    /**
     * POST /api/guru
     * Tambah guru baru (sekaligus membuat User account).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nama'                => 'required|string|max:255',
            'email'               => 'required|email|unique:users,email',
            'nip'                 => 'required|string|unique:gurus,nip',
            'jenis_kelamin'       => 'required|in:L,P',
            'tanggal_lahir'       => 'nullable|date',
            'telepon'             => 'nullable|string|max:20',
            'alamat'              => 'nullable|string',
            'pendidikan_terakhir' => 'nullable|string|max:10',
            'status'              => 'nullable|in:aktif,nonaktif',
            'password'            => 'required|string|min:8',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name'               => $request->nama,
                'email'              => $request->email,
                'password'           => Hash::make($request->password),
                'role'               => 'guru',
                'email_verified_at'  => now(),
            ]);

            $guru = Guru::create([
                'user_id'             => $user->id,
                'nip'                 => $request->nip,
                'nama'                => $request->nama,
                'email'               => $request->email,
                'jenis_kelamin'       => $request->jenis_kelamin,
                'tanggal_lahir'       => $request->tanggal_lahir,
                'telepon'             => $request->telepon,
                'alamat'              => $request->alamat,
                'pendidikan_terakhir' => $request->pendidikan_terakhir,
                'status'              => $request->status ?? 'aktif',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data guru berhasil ditambahkan',
                'data'    => $guru->load('user'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/guru/{id}
     * Detail satu guru.
     */
    public function show(Guru $guru): JsonResponse
    {
        $guru->load(['user', 'mataPelajarans', 'jadwals.kelas', 'jadwals.mataPelajaran']);

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Guru',
            'data'    => $guru,
            'statistics' => [
                'total_jadwal' => $guru->jadwals()->count(),
                'total_mapel'  => $guru->mataPelajarans()->count(),
                'total_kelas'  => $guru->jadwals()->distinct('kelas_id')->count('kelas_id'),
            ],
        ], 200);
    }

    /**
     * PUT /api/guru/{id}
     * Update data guru.
     */
    public function update(Request $request, Guru $guru): JsonResponse
    {
        $request->validate([
            'nama'                => 'required|string|max:255',
            'email'               => ['required', 'email', Rule::unique('users', 'email')->ignore($guru->user_id)],
            'nip'                 => ['required', 'string', Rule::unique('gurus', 'nip')->ignore($guru->id)],
            'jenis_kelamin'       => 'required|in:L,P',
            'tanggal_lahir'       => 'nullable|date',
            'telepon'             => 'nullable|string|max:20',
            'alamat'              => 'nullable|string',
            'pendidikan_terakhir' => 'nullable|string|max:10',
            'status'              => 'required|in:aktif,nonaktif',
        ]);

        DB::beginTransaction();
        try {
            $guru->user->update([
                'name'  => $request->nama,
                'email' => $request->email,
            ]);

            $guru->update([
                'nip'                 => $request->nip,
                'nama'                => $request->nama,
                'email'               => $request->email,
                'jenis_kelamin'       => $request->jenis_kelamin,
                'tanggal_lahir'       => $request->tanggal_lahir,
                'telepon'             => $request->telepon,
                'alamat'              => $request->alamat,
                'pendidikan_terakhir' => $request->pendidikan_terakhir,
                'status'              => $request->status,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data guru berhasil diperbarui',
                'data'    => $guru->load('user'),
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui data',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/guru/{id}
     * Hapus guru beserta user account-nya.
     */
    public function destroy(Guru $guru): JsonResponse
    {
        DB::beginTransaction();
        try {
            $user = $guru->user;
            $guru->delete();
            if ($user) {
                $user->delete();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data guru berhasil dihapus',
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
