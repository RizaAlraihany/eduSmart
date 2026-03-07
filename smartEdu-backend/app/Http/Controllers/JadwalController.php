<?php

namespace App\Http\Controllers;

use App\Models\Jadwal;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class JadwalController extends Controller
{
    /**
     * GET /api/jadwal
     *
     * FIX: Tambahkan filter untuk role siswa.
     * Sebelumnya: tidak ada filter siswa → return semua jadwal (data bocor).
     * Sekarang: jika user isSiswa(), auto-filter by kelas_id siswa yang login.
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Jadwal::with(['kelas', 'mataPelajaran', 'guru']);

        // Filter by role
        if ($user->isGuru()) {
            // Guru hanya lihat jadwal mengajarnya sendiri
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $query->where('guru_id', $guru->id);
        } elseif ($user->isSiswa()) {
            // Siswa hanya lihat jadwal kelasnya
            $siswa = $user->siswa;
            if (! $siswa) {
                return $this->successResponse([], 'Profil siswa tidak ditemukan.');
            }
            $query->where('kelas_id', $siswa->kelas_id);
        }

        // Filter tambahan (bisa dipakai semua role)
        if ($request->filled('kelas_id') && ! $user->isSiswa()) {
            // Siswa tidak bisa override kelas_id milik sendiri
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
     * Hanya admin + guru (dikontrol di api.php via middleware role:admin,guru)
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

        ActivityLog::catat(
            $user,
            'tambah_jadwal',
            $jadwal,
            "Menambahkan jadwal {$request->hari} kelas ID {$request->kelas_id}",
            $request->ip()
        );

        return $this->createdResponse($jadwal->load(['kelas', 'mataPelajaran', 'guru']), 'Jadwal berhasil ditambahkan');
    }

    /**
     * GET /api/jadwal/{jadwal}
     */
    public function show(Request $request, Jadwal $jadwal): JsonResponse
    {
        $user = $request->user();

        // Siswa hanya bisa lihat jadwal kelasnya
        if ($user->isSiswa()) {
            $siswa = $user->siswa;
            if ($siswa && $jadwal->kelas_id !== $siswa->kelas_id) {
                return $this->forbiddenResponse('Anda tidak memiliki akses ke jadwal ini.');
            }
        }

        return $this->successResponse(
            $jadwal->load(['kelas', 'mataPelajaran', 'guru']),
            'Detail Jadwal'
        );
    }

    /**
     * PUT /api/jadwal/{jadwal}
     * Hanya admin + guru
     */
    public function update(Request $request, Jadwal $jadwal): JsonResponse
    {
        $user = $request->user();

        // Guru hanya bisa edit jadwal miliknya
        if ($user->isGuru()) {
            $guru = $user->guru;
            if (! $guru || $jadwal->guru_id !== $guru->id) {
                return $this->forbiddenResponse('Anda tidak memiliki akses untuk mengubah jadwal ini.');
            }
        }

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

        $jadwal->update($request->only([
            'kelas_id',
            'mata_pelajaran_id',
            'hari',
            'jam_mulai',
            'jam_selesai',
            'ruangan',
            'semester',
            'tahun_ajaran',
            'status',
        ]));

        return $this->successResponse(
            $jadwal->load(['kelas', 'mataPelajaran', 'guru']),
            'Jadwal berhasil diperbarui'
        );
    }

    /**
     * DELETE /api/jadwal/{jadwal}
     * Hanya admin + guru
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

        $jadwal->delete();

        return $this->successResponse(null, 'Jadwal berhasil dihapus');
    }
}
