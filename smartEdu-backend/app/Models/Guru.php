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

     
    // RELASI
    
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

    // SCOPES

    /**
     * Filter guru yang berstatus aktif.
     * Usage: Guru::aktif()->get()
     */
    public function scopeAktif($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Filter tugas milik guru ini yang belum ada nilai sama sekali.
     * Dipakai via relasi: $guru->tugass()->belumDinilai()->get()
     *
     * Catatan: logic semester-aware & perhitungan per-siswa ada di GuruService.
     * Scope ini hanya untuk filter sederhana tanpa konteks semester.
     */
    public function scopeBelumDinilai($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('status', 'aktif')
            ->whereDoesntHave('nilais');
    }

    // HELPERS

    /**
     * Jumlah kelas unik yang diajar pada semester & tahun ajaran tertentu.
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

}
