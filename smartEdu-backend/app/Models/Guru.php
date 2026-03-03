<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Guru extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'nip',
        'nama',
        'email',
        'telepon',
        'alamat',
        'tanggal_lahir',
        'jenis_kelamin',
        'pendidikan_terakhir',
        'status',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    // ─── Relasi ───────────────────────────────────────────────────────────────

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function mataPelajarans(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(MataPelajaran::class, 'guru_mata_pelajaran');
    }

    public function jadwals(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Jadwal::class);
    }

    public function absensis(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Absensi::class);
    }

    public function nilais(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Nilai::class);
    }

    public function tugass(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Tugas::class);
    }

    // ─── Kelas yang diajar (via jadwal, distinct) ─────────────────────────────
    public function kelasYangDiajar(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        // Tidak pakai hasManyThrough karena ada kelas duplikat per hari.
        // Gunakan query scope di controller.
        return $this->hasMany(Jadwal::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Jumlah kelas unik yang diajar semester ini.
     */
    public function totalKelasAktif(string $semester, string $tahunAjaran): int
    {
        return $this->jadwals()
            ->where('semester', $semester)
            ->where('tahun_ajaran', $tahunAjaran)
            ->where('status', 'aktif')
            ->distinct('kelas_id')
            ->count('kelas_id');
    }

    /**
     * Tugas yang belum ada nilai masuk sama sekali.
     */
    public function tugasBelumDinilai()
    {
        return $this->tugass()
            ->where('status', 'aktif')
            ->whereDoesntHave('nilais')
            ->with(['kelas', 'mataPelajaran'])
            ->orderBy('tanggal_deadline')
            ->get();
    }
}
