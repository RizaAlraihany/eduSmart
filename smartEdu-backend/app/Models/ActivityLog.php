<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    // Tidak ada updated_at karena log tidak pernah diupdate
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'description',
        'ip_address',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // ─── Relasi ───────────────────────────────────────────────────────────────

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── Helper static untuk menulis log dengan mudah ─────────────────────────

    /**
     * Catat aktivitas.
     *
     * Contoh penggunaan di controller:
     *   ActivityLog::catat($request->user(), 'tambah_siswa', $siswa, 'Menambahkan siswa: Budi');
     */
    public static function catat(
        User $user,
        string $action,
        ?Model $model = null,
        ?string $description = null,
        ?string $ip = null
    ): self {
        return self::create([
            'user_id'     => $user->id,
            'action'      => $action,
            'model_type'  => $model ? class_basename($model) : null,
            'model_id'    => $model?->getKey(),
            'description' => $description,
            'ip_address'  => $ip,
        ]);
    }
}
