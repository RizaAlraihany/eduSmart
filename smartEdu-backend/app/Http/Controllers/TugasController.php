<?php

namespace App\Http\Controllers;

use App\Models\Tugas;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TugasController extends Controller
{
    /**
     * GET /api/tugas
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Tugas::with(['guru', 'kelas', 'mataPelajaran']);

        if ($user->isGuru()) {
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $query->where('guru_id', $guru->id);
        } elseif ($user->isSiswa()) {
            $siswa = $user->siswa;
            abort_unless($siswa && $siswa->kelas_id, 403, 'Profil siswa / kelas tidak ditemukan.');
            $query->where('kelas_id', $siswa->kelas_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->filled('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }
        if ($request->filled('search')) {
            $query->where('judul', 'like', "%{$request->search}%");
        }

        $tugas = $query->orderBy('tanggal_deadline')->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($tugas, 'Daftar tugas berhasil diambil');
    }

    /**
     * POST /api/tugas
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'kelas_id'          => 'required|exists:kelas,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'judul'             => 'required|string|max:255',
            'deskripsi'         => 'nullable|string',
            'tanggal_diberikan' => 'required|date',
            'tanggal_deadline'  => 'required|date|after_or_equal:tanggal_diberikan',
            'semester'          => 'required|in:1,2',
            'tahun_ajaran'      => 'required|string',
            'status'            => 'required|in:aktif,selesai',
        ]);

        if ($user->isGuru()) {
            $guru = $user->guru;
            abort_unless($guru, 403, 'Profil guru tidak ditemukan.');
            $guruId = $guru->id;
        } else {
            $request->validate(['guru_id' => 'required|exists:gurus,id']);
            $guruId = $request->guru_id;
        }

        $tugas = Tugas::create([
            'guru_id'           => $guruId,
            'kelas_id'          => $request->kelas_id,
            'mata_pelajaran_id' => $request->mata_pelajaran_id,
            'judul'             => $request->judul,
            'deskripsi'         => $request->deskripsi,
            'tanggal_diberikan' => $request->tanggal_diberikan,
            'tanggal_deadline'  => $request->tanggal_deadline,
            'semester'          => $request->semester,
            'tahun_ajaran'      => $request->tahun_ajaran,
            'status'            => $request->status,
        ]);

        ActivityLog::catat(
            $user,
            'create_tugas',
            $tugas,
            "Membuat tugas: {$tugas->judul}",
            $request->ip()
        );

        return $this->createdResponse(
            $tugas->load(['guru', 'kelas', 'mataPelajaran']),
            'Tugas berhasil ditambahkan'
        );
    }

    /**
     * GET /api/tugas/{tugas}
     */
    public function show(Tugas $tugas): JsonResponse
    {
        return $this->successResponse(
            $tugas->load(['guru', 'kelas', 'mataPelajaran']),
            'Detail Tugas'
        );
    }

    /**
     * PUT /api/tugas/{tugas}
     */
    public function update(Request $request, Tugas $tugas): JsonResponse
    {
        $user = $request->user();

        if ($user->isGuru() && $tugas->guru_id !== $user->guru?->id) {
            return $this->forbiddenResponse('Anda tidak memiliki akses untuk mengubah tugas ini.');
        }

        $validated = $request->validate([
            'kelas_id'          => ['sometimes', 'exists:kelas,id'],
            'mata_pelajaran_id' => ['sometimes', 'exists:mata_pelajarans,id'],
            'judul'             => ['sometimes', 'string', 'max:255'],
            'deskripsi'         => ['nullable', 'string'],
            'tanggal_diberikan' => ['sometimes', 'date'],
            'tanggal_deadline'  => ['sometimes', 'date', 'after_or_equal:tanggal_diberikan'],
            'semester'          => ['sometimes', 'in:1,2'],
            'tahun_ajaran'      => ['sometimes', 'string'],
            'status'            => ['sometimes', 'in:aktif,selesai'],
        ]);

        $tugas->update($validated);

        ActivityLog::catat($user, 'update_tugas', $tugas, "Mengubah tugas: {$tugas->judul}", $request->ip());

        return $this->successResponse(
            $tugas->load(['guru', 'kelas', 'mataPelajaran']),
            'Tugas berhasil diperbarui'
        );
    }

    /**
     * DELETE /api/tugas/{tugas}
     */
    public function destroy(Request $request, Tugas $tugas): JsonResponse
    {
        $user = $request->user();

        if ($user->isGuru() && $tugas->guru_id !== $user->guru?->id) {
            return $this->forbiddenResponse('Anda tidak memiliki akses untuk menghapus tugas ini.');
        }

        ActivityLog::catat($user, 'hapus_tugas', $tugas, "Menghapus tugas: {$tugas->judul}", $request->ip());

        $tugas->delete();

        return $this->successResponse(null, 'Tugas berhasil dihapus');
    }
}
