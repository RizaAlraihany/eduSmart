<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengumuman extends Model
{
    use HasFactory;

    protected $table = 'pengumumen';

    protected $fillable = [
        'judul',
        'isi',
        'tipe',
        'target_audience',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
        'dibuat_oleh',
    ];

    protected $casts = [
        'tanggal_mulai' => 'datetime',
        'tanggal_selesai' => 'datetime',
    ];

    public function pembuatPengumuman()
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}
