<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class GuruController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Guru::with('user');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by jenis kelamin
        if ($request->has('jenis_kelamin')) {
            $query->where('jenis_kelamin', $request->jenis_kelamin);
        }

        // Filter by pendidikan
        if ($request->has('pendidikan_terakhir')) {
            $query->where('pendidikan_terakhir', $request->pendidikan_terakhir);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $gurus = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $gurus->items(),
            'current_page' => $gurus->currentPage(),
            'last_page' => $gurus->lastPage(),
            'per_page' => $gurus->perPage(),
            'total' => $gurus->total(),
            'statistics' => [
                'total_guru' => Guru::count(),
                'guru_aktif' => Guru::where('status', 'aktif')->count(),
                'guru_laki' => Guru::where('jenis_kelamin', 'L')->count(),
                'guru_perempuan' => Guru::where('jenis_kelamin', 'P')->count(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nip' => 'required|string|unique:gurus,nip',
            'jenis_kelamin' => 'required|in:L,P',
            'tanggal_lahir' => 'nullable|date',
            'telepon' => 'nullable|string',
            'alamat' => 'nullable|string',
            'pendidikan_terakhir' => 'nullable|string',
            'password' => 'required|string|min:8',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $request->nama,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'guru',
                'email_verified_at' => now(),
            ]);

            $guru = Guru::create([
                'user_id' => $user->id,
                'nip' => $request->nip,
                'nama' => $request->nama,
                'email' => $request->email,
                'jenis_kelamin' => $request->jenis_kelamin,
                'tanggal_lahir' => $request->tanggal_lahir,
                'telepon' => $request->telepon,
                'alamat' => $request->alamat,
                'pendidikan_terakhir' => $request->pendidikan_terakhir,
                'status' => 'aktif',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Data guru berhasil ditambahkan',
                'data' => $guru->load('user')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Guru $guru)
    {
        $guru->load(['user', 'mataPelajarans', 'jadwals.kelas', 'jadwals.mataPelajaran']);

        return response()->json([
            'data' => $guru,
            'statistics' => [
                'total_jadwal' => $guru->jadwals()->count(),
                'total_mapel' => $guru->mataPelajarans()->count(),
                'total_kelas' => $guru->jadwals()->distinct('kelas_id')->count('kelas_id'),
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Guru $guru)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($guru->user_id)],
            'nip' => ['required', 'string', Rule::unique('gurus', 'nip')->ignore($guru->id)],
            'jenis_kelamin' => 'required|in:L,P',
            'tanggal_lahir' => 'nullable|date',
            'telepon' => 'nullable|string',
            'alamat' => 'nullable|string',
            'pendidikan_terakhir' => 'nullable|string',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        DB::beginTransaction();
        try {
            $guru->user->update([
                'name' => $request->nama,
                'email' => $request->email,
            ]);

            $guru->update([
                'nip' => $request->nip,
                'nama' => $request->nama,
                'email' => $request->email,
                'jenis_kelamin' => $request->jenis_kelamin,
                'tanggal_lahir' => $request->tanggal_lahir,
                'telepon' => $request->telepon,
                'alamat' => $request->alamat,
                'pendidikan_terakhir' => $request->pendidikan_terakhir,
                'status' => $request->status,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Data guru berhasil diperbarui',
                'data' => $guru->load('user')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat memperbarui data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Guru $guru)
    {
        DB::beginTransaction();
        try {
            $user = $guru->user;
            $guru->delete();
            $user->delete();

            DB::commit();

            return response()->json([
                'message' => 'Data guru berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
