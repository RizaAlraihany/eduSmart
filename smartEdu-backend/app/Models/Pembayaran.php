<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pembayaran extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'siswa_id',
        'jenis_pembayaran',
        'jumlah',
        'tanggal_pembayaran',
        'tanggal_jatuh_tempo',
        'status_pembayaran',
        'metode_pembayaran',
        'keterangan',
    ];

    protected $casts = [
        'jumlah'              => 'decimal:2',
        'tanggal_pembayaran'  => 'datetime',
        'tanggal_jatuh_tempo' => 'date',
    ];

    // ─── Relasi ───────────────────────────────────────────────────────────────

    public function siswa(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }
}
