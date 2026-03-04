<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tugas extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'guru_id',
        'kelas_id',
        'mata_pelajaran_id',
        'judul',
        'deskripsi',
        'tanggal_diberikan',
        'tanggal_deadline',
        'semester',
        'tahun_ajaran',
        'status',
    ];

    protected $casts = [
        'tanggal_diberikan' => 'date',
        'tanggal_deadline'  => 'date',
    ];

    // Relasi 

    public function guru(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Guru::class);
    }

    public function kelas(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Kelas::class);
    }

    public function mataPelajaran(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(MataPelajaran::class);
    }

    /**
     * Nilai yang masuk untuk tugas ini.
     * Dipakai untuk cek sudah berapa siswa yang dinilai.
     */
    public function nilais(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Nilai::class);
    }

    // Scopes 

    /**
     * Tugas yang masih aktif dan belum lewat deadline.
     * Dipakai di dashboard siswa untuk "tugas terdekat".
     */
    public function scopeAktifBelumDeadline($query)
    {
        return $query->where('status', 'aktif')
                     ->where('tanggal_deadline', '>=', today());
    }

    /**
     * Tugas yang sudah lewat deadline tapi belum semua siswa dinilai.
     * Dipakai di dashboard guru untuk "tugas belum dinilai".
     */
    public function scopeBelumDinilaiSemua($query)
    {
        return $query->whereDoesntHave('nilais');
    }
}
