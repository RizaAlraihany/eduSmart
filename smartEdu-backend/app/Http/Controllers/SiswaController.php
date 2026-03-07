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
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $siswas = $query->latest()->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($siswas, 'Daftar Data Siswa');
    }

    /**
     * POST /api/siswa
     *
     * FIX: Tambahkan validasi 'nik' yang sebelumnya tidak ada.
     * Kolom siswas.nik bersifat NOT NULL + UNIQUE di database,
     * sehingga tanpa validasi ini akan terjadi DB constraint error → HTTP 500.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nama'              => 'required|string|max:255',
            'nisn'              => 'required|string|unique:siswas,nisn',
            'nik'               => 'required|string|size:16|unique:siswas,nik', // FIX: ditambahkan
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
        ], [
            'nik.required' => 'NIK wajib diisi.',
            'nik.size'     => 'NIK harus tepat 16 digit.',
            'nik.unique'   => 'NIK ini sudah terdaftar.',
            'nisn.unique'  => 'NISN ini sudah terdaftar.',
            'email.unique' => 'Email ini sudah digunakan.',
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
                'nik'               => $request->nik,   // FIX: ditambahkan
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

            return $this->createdResponse($siswa->load(['user', 'kelas']), 'Data siswa berhasil ditambahkan');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('[SiswaController@store]', [
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
                'request' => $request->except(['password']),
            ]);

            return $this->serverErrorResponse();
        }
    }

    /**
     * GET /api/siswa/{siswa}
     */
    public function show(Siswa $siswa): JsonResponse
    {
        return $this->successResponse($siswa->load(['user', 'kelas']), 'Detail Data Siswa');
    }

    /**
     * PUT /api/siswa/{siswa}
     *
     * FIX: Tambahkan validasi 'nik' dengan ignore untuk update.
     */
    public function update(Request $request, Siswa $siswa): JsonResponse
    {
        $request->validate([
            'nama'              => 'required|string|max:255',
            'nisn'              => ['required', 'string', Rule::unique('siswas', 'nisn')->ignore($siswa->id)],
            'nik'               => ['required', 'string', 'size:16', Rule::unique('siswas', 'nik')->ignore($siswa->id)], // FIX: ditambahkan
            'email'             => ['required', 'email', Rule::unique('siswas', 'email')->ignore($siswa->id)],
            'kelas_id'          => 'required|exists:kelas,id',
            'jenis_kelamin'     => 'required|in:L,P',
            'tanggal_lahir'     => 'required|date',
            'telepon'           => 'nullable|string|max:20',
            'alamat'            => 'nullable|string',
            'nama_orang_tua'    => 'nullable|string|max:255',
            'telepon_orang_tua' => 'nullable|string|max:20',
            'status'            => 'required|in:aktif,nonaktif,lulus,pindah',
        ], [
            'nik.size'   => 'NIK harus tepat 16 digit.',
            'nik.unique' => 'NIK ini sudah digunakan oleh siswa lain.',
        ]);

        DB::beginTransaction();
        try {
            $siswa->update([
                'nama'              => $request->nama,
                'nik'               => $request->nik,   // FIX: ditambahkan
                'nisn'              => $request->nisn,
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

            return $this->successResponse($siswa->load(['user', 'kelas']), 'Data siswa berhasil diperbarui');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('[SiswaController@update]', [
                'siswa_id' => $siswa->id,
                'error'    => $e->getMessage(),
                'line'     => $e->getLine(),
            ]);

            return $this->serverErrorResponse();
        }
    }

    /**
     * DELETE /api/siswa/{siswa}
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

            return $this->successResponse(null, 'Data siswa berhasil dihapus');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('[SiswaController@destroy]', [
                'siswa_id' => $siswa->id,
                'error'    => $e->getMessage(),
                'line'     => $e->getLine(),
            ]);

            return $this->serverErrorResponse();
        }
    }
}