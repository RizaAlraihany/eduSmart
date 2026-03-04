<?php

namespace App\Http\Controllers;

use App\Models\Jadwal;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JadwalController extends Controller
{
    /**
     * GET /api/jadwal
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Jadwal::with(['kelas', 'mataPelajaran', 'guru']);

        if ($user->isGuru()) {
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $query->where('guru_id', $guru->id);
        }

        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }
        if ($request->filled('guru_id') && $user->isAdmin()) {
            $query->where('guru_id', $request->guru_id);
        }
        if ($request->filled('hari')) {
            $query->where('hari', $request->hari);
        }
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->filled('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $jadwals = $query->orderBy('hari')->orderBy('jam_mulai')->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($jadwals, 'Data Jadwal berhasil diambil');
    }

    /**
     * POST /api/jadwal
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'kelas_id'          => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'hari'              => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai'         => 'required|date_format:H:i',
            'jam_selesai'       => 'required|date_format:H:i|after:jam_mulai',
            'ruangan'           => 'nullable|string|max:50',
            'semester'          => 'required|in:1,2',
            'tahun_ajaran'      => 'required|string|max:20',
            'status'            => 'required|in:aktif,nonaktif',
        ]);

        if ($user->isGuru()) {
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $guruId = $guru->id;
        } else {
            $request->validate(['guru_id' => 'required|exists:gurus,id']);
            $guruId = $request->guru_id;
        }

        $jadwal = Jadwal::create([
            'kelas_id'          => $request->kelas_id,
            'mata_pelajaran_id' => $request->mata_pelajaran_id,
            'guru_id'           => $guruId,
            'hari'              => $request->hari,
            'jam_mulai'         => $request->jam_mulai,
            'jam_selesai'       => $request->jam_selesai,
            'ruangan'           => $request->ruangan,
            'semester'          => $request->semester,
            'tahun_ajaran'      => $request->tahun_ajaran,
            'status'            => $request->status,
        ]);

        ActivityLog::catat($user, 'create_jadwal', $jadwal, "Membuat jadwal {$jadwal->hari}", $request->ip());

        return $this->createdResponse($jadwal->load(['kelas', 'mataPelajaran', 'guru']), 'Jadwal berhasil ditambahkan');
    }

    /**
     * GET /api/jadwal/{jadwal}
     */
    public function show(Jadwal $jadwal): JsonResponse
    {
        return $this->successResponse(
            $jadwal->load(['kelas', 'mataPelajaran', 'guru']),
            'Detail Jadwal'
        );
    }

    /**
     * PUT /api/jadwal/{jadwal}
     */
    public function update(Request $request, Jadwal $jadwal): JsonResponse
    {
        $user = $request->user();

        if ($user->isGuru()) {
            $guru = $user->guru;
            if (! $guru || $jadwal->guru_id !== $guru->id) {
                return $this->forbiddenResponse('Anda tidak memiliki akses untuk mengubah jadwal ini.');
            }
        }

        $validated = $request->validate([
            'kelas_id'          => ['sometimes', 'exists:kelas,id'],
            'mata_pelajaran_id' => ['sometimes', 'exists:mata_pelajarans,id'],
            'hari'              => ['sometimes', 'in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu'],
            'jam_mulai'         => ['sometimes', 'date_format:H:i'],
            'jam_selesai'       => ['sometimes', 'date_format:H:i', 'after:jam_mulai'],
            'ruangan'           => ['nullable', 'string', 'max:50'],
            'semester'          => ['sometimes', 'in:1,2'],
            'tahun_ajaran'      => ['sometimes', 'string', 'max:20'],
            'status'            => ['sometimes', 'in:aktif,nonaktif'],
        ]);

        $jadwal->update($validated);

        ActivityLog::catat($user, 'update_jadwal', $jadwal, "Mengubah jadwal ID {$jadwal->id}", $request->ip());

        return $this->successResponse($jadwal->load(['kelas', 'mataPelajaran', 'guru']), 'Jadwal berhasil diperbarui');
    }

    /**
     * DELETE /api/jadwal/{jadwal}
     */
    public function destroy(Request $request, Jadwal $jadwal): JsonResponse
    {
        $user = $request->user();

        if ($user->isGuru()) {
            $guru = $user->guru;
            if (! $guru || $jadwal->guru_id !== $guru->id) {
                return $this->forbiddenResponse('Anda tidak memiliki akses untuk menghapus jadwal ini.');
            }
        }

        ActivityLog::catat($user, 'hapus_jadwal', $jadwal, "Menghapus jadwal ID {$jadwal->id}", $request->ip());

        $jadwal->delete();

        return $this->successResponse(null, 'Jadwal berhasil dihapus');
    }
}
