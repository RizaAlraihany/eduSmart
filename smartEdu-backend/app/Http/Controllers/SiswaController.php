<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SiswaController extends Controller
{
    public function index(Request $request)
    {
        $query = Siswa::with(['user', 'kelas']);

        // Filter by kelas
        if ($request->has('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by jenis kelamin
        if ($request->has('jenis_kelamin')) {
            $query->where('jenis_kelamin', $request->jenis_kelamin);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $siswas = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar Data Siswa',
            'data' => $siswas->items(),
            'meta' => [
                'current_page' => $siswas->currentPage(),
                'last_page' => $siswas->lastPage(),
                'per_page' => $siswas->perPage(),
                'total' => $siswas->total(),
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nisn' => 'required|string|unique:siswas,nisn',
            'email' => 'required|email|unique:users,email|unique:siswas,email',
            'password' => 'required|string|min:8',
            'kelas_id' => 'required|exists:kelas,id',
            'jenis_kelamin' => 'required|in:L,P',
            'tanggal_lahir' => 'required|date',
            'telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'nama_orang_tua' => 'nullable|string|max:255',
            'telepon_orang_tua' => 'nullable|string|max:20',
            'status' => 'required|in:aktif,nonaktif,lulus,pindah',
        ]);

        DB::beginTransaction();
        try {
            // Create user for the siswa
            $user = User::create([
                'name' => $request->nama,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'siswa',
            ]);

            // Create siswa profile
            $siswa = Siswa::create([
                'user_id' => $user->id,
                'kelas_id' => $request->kelas_id,
                'nisn' => $request->nisn,
                'nama' => $request->nama,
                'email' => $request->email,
                'jenis_kelamin' => $request->jenis_kelamin,
                'tanggal_lahir' => $request->tanggal_lahir,
                'telepon' => $request->telepon,
                'alamat' => $request->alamat,
                'nama_orang_tua' => $request->nama_orang_tua,
                'telepon_orang_tua' => $request->telepon_orang_tua,
                'status' => $request->status,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data siswa berhasil ditambahkan',
                'data' => $siswa->load(['user', 'kelas'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menambahkan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Siswa $siswa)
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail Data Siswa',
            'data' => $siswa->load(['user', 'kelas'])
        ], 200);
    }

    public function update(Request $request, Siswa $siswa)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('siswas')->ignore($siswa->id)],
            'kelas_id' => 'required|exists:kelas,id',
            'jenis_kelamin' => 'required|in:L,P',
            'tanggal_lahir' => 'required|date',
            'telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'nama_orang_tua' => 'nullable|string|max:255',
            'telepon_orang_tua' => 'nullable|string|max:20',
            'status' => 'required|in:aktif,nonaktif,lulus,pindah',
        ]);

        DB::beginTransaction();
        try {
            $siswa->update([
                'nama' => $request->nama,
                'email' => $request->email,
                'kelas_id' => $request->kelas_id,
                'jenis_kelamin' => $request->jenis_kelamin,
                'tanggal_lahir' => $request->tanggal_lahir,
                'telepon' => $request->telepon,
                'alamat' => $request->alamat,
                'nama_orang_tua' => $request->nama_orang_tua,
                'telepon_orang_tua' => $request->telepon_orang_tua,
                'status' => $request->status,
            ]);

            if ($siswa->user) {
                $siswa->user->update([
                    'name' => $request->nama,
                    'email' => $request->email,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data siswa berhasil diperbarui',
                'data' => $siswa->load(['user', 'kelas'])
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Siswa $siswa)
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
                'message' => 'Data siswa berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
