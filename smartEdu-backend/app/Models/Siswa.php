<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Siswa extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'kelas_id',
        'nik',
        'nisn',
        'nama',
        'email',
        'telepon',
        'alamat',
        'tanggal_lahir',
        'jenis_kelamin',
        'nama_orang_tua',
        'telepon_orang_tua',
        'status',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    // Relasi 

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function kelas(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Kelas::class);
    }

    public function absensis(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Absensi::class);
    }

    public function nilais(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Nilai::class);
    }

    public function pembayarans(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Pembayaran::class);
    }

    // Helpers 

    /**
     * Tugas aktif untuk kelas siswa ini yang belum lewat deadline.
     * Dipakai di dashboard siswa: "Tugas Terdekat".
     */
    public function tugasAktif()
    {
        if (! $this->kelas_id) {
            return collect();
        }

        return Tugas::where('kelas_id', $this->kelas_id)
            ->where('status', 'aktif')
            ->where('tanggal_deadline', '>=', today())
            ->with(['mataPelajaran', 'guru'])
            ->orderBy('tanggal_deadline')
            ->get();
    }

    /**
     * Persentase kehadiran siswa (bulan berjalan).
     */
    public function persenHadirBulanIni(): float
    {
        $total = $this->absensis()
            ->whereMonth('tanggal', now()->month)
            ->whereYear('tanggal', now()->year)
            ->count();

        if ($total === 0) {
            return 0;
        }

        $hadir = $this->absensis()
            ->whereMonth('tanggal', now()->month)
            ->whereYear('tanggal', now()->year)
            ->where('status_kehadiran', 'hadir')
            ->count();

        return round(($hadir / $total) * 100, 1);
    }

    /**
     * Nilai rata-rata semester berjalan.
     */
    public function rataNilaiSemesterIni(string $semester, string $tahunAjaran): float
    {
        return round(
            $this->nilais()
                ->where('semester', $semester)
                ->where('tahun_ajaran', $tahunAjaran)
                ->avg('nilai') ?? 0,
            2
        );
    }
}
