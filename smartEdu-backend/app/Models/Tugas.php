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

    public function nilais(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Nilai::class);
    }

    // Scopes 

    public function scopeAktifBelumDeadline($query)
    {
        return $query->where('status', 'aktif')
            ->where('tanggal_deadline', '>=', today());
    }

    public function scopeBelumDinilaiSemua($query)
    {
        return $query->whereDoesntHave('nilais');
    }
}
