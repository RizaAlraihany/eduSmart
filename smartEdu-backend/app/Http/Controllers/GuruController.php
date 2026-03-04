<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\User;
use App\Http\Requests\StoreGuruRequest;
use App\Http\Requests\UpdateGuruRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class GuruController extends Controller
{
    /**
     * GET /api/guru
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

        return $this->paginatedResponse($gurus, 'Daftar Data Guru', [
            'statistics' => [
                'total_guru'     => Guru::count(),
                'guru_aktif'     => Guru::where('status', 'aktif')->count(),
                'guru_laki'      => Guru::where('jenis_kelamin', 'L')->count(),
                'guru_perempuan' => Guru::where('jenis_kelamin', 'P')->count(),
            ],
        ]);
    }

    /**
     * POST /api/guru
     */
    public function store(StoreGuruRequest $request): JsonResponse
    {
        $validated = $request->validated();

        DB::beginTransaction();
        try {
            $user = User::create([
                'name'              => $validated['nama'],
                'email'             => $validated['email'],
                'password'          => Hash::make($validated['password']),
                'role'              => 'guru',
                'email_verified_at' => now(),
            ]);

            $guru = Guru::create([
                'user_id'             => $user->id,
                'nip'                 => $validated['nip'],
                'nama'                => $validated['nama'],
                'email'               => $validated['email'],
                'jenis_kelamin'       => $validated['jenis_kelamin'],
                'tanggal_lahir'       => $validated['tanggal_lahir'] ?? null,
                'telepon'             => $validated['telepon'] ?? null,
                'alamat'              => $validated['alamat'] ?? null,
                'pendidikan_terakhir' => $validated['pendidikan_terakhir'] ?? null,
                'status'              => $validated['status'] ?? 'aktif',
            ]);

            DB::commit();

            return $this->createdResponse($guru->load('user'), 'Data guru berhasil ditambahkan');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('[GuruController@store]', [
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
                'request' => $request->except(['password']),
            ]);

            return $this->serverErrorResponse();
        }
    }

    /**
     * GET /api/guru/{guru}
     */
    public function show(Guru $guru): JsonResponse
    {
        $guru->load([
            'user',
            'mataPelajarans:id,nama_mapel,kode_mapel',
            'jadwals:id,guru_id,kelas_id,mata_pelajaran_id,hari,jam_mulai,jam_selesai,semester,tahun_ajaran,status',
            'jadwals.kelas:id,nama_kelas,tingkat',
            'jadwals.mataPelajaran:id,nama_mapel',
        ]);

        $totalJadwal = $guru->jadwals->count();
        $totalMapel  = $guru->mataPelajarans->count();
        $totalKelas  = $guru->jadwals->pluck('kelas_id')->unique()->count();

        return $this->successResponse($guru, 'Detail Data Guru', 200, [
            'total_jadwal' => $totalJadwal,
            'total_mapel'  => $totalMapel,
            'total_kelas'  => $totalKelas,
        ]);
    }

    /**
     * PUT /api/guru/{guru}
     */
    public function update(UpdateGuruRequest $request, Guru $guru): JsonResponse
    {
        $validated = $request->validated();

        DB::beginTransaction();
        try {
            $guru->user->update([
                'name'  => $validated['nama'],
                'email' => $validated['email'],
            ]);

            $guru->update([
                'nip'                 => $validated['nip'],
                'nama'                => $validated['nama'],
                'email'               => $validated['email'],
                'jenis_kelamin'       => $validated['jenis_kelamin'],
                'tanggal_lahir'       => $validated['tanggal_lahir'] ?? null,
                'telepon'             => $validated['telepon'] ?? null,
                'alamat'              => $validated['alamat'] ?? null,
                'pendidikan_terakhir' => $validated['pendidikan_terakhir'] ?? null,
                'status'              => $validated['status'],
            ]);

            DB::commit();

            return $this->successResponse($guru->load('user'), 'Data guru berhasil diperbarui');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('[GuruController@update]', [
                'guru_id' => $guru->id,
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
            ]);

            return $this->serverErrorResponse();
        }
    }

    /**
     * DELETE /api/guru/{guru}
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

            return $this->successResponse(null, 'Data guru berhasil dihapus');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('[GuruController@destroy]', [
                'guru_id' => $guru->id,
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
            ]);

            return $this->serverErrorResponse();
        }
    }
}
