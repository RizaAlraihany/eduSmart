<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MataPelajaran extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_mapel',
        'nama_mapel',
        'deskripsi',
        'kkm',
        'status',
    ];

    protected $casts = [
        'kkm' => 'decimal:2',
    ];

    public function gurus()
    {
        return $this->belongsToMany(Guru::class, 'guru_mata_pelajaran');
    }

    public function jadwals()
    {
        return $this->hasMany(Jadwal::class);
    }

    public function nilais()
    {
        return $this->hasMany(Nilai::class);
    }
}
