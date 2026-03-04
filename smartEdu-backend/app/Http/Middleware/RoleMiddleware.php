<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Penggunaan di routes/api.php:
     *   ->middleware('role:admin')          — satu role
     *   ->middleware('role:admin,guru')     — admin ATAU guru
     *   ->middleware('role:admin,guru,siswa') — semua role
     *
     * Alur pengecekan:
     *   1. Cek apakah user sudah terautentikasi (session/cookie Sanctum aktif)
     *   2. Cek apakah role user ada di daftar $roles yang diizinkan
     *   3. Jika tidak → return JSON 401/403 (TIDAK redirect, ini API)
     *
     * @param  string  ...$roles  Role yang diizinkan, dikirim via route middleware parameter
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // ── Guard 1: Autentikasi ──────────────────────────────────────────────
        // Gunakan $request->user() bukan auth()->check()
        // karena Sanctum SPA binding ke request object, bukan global auth()
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Silakan login terlebih dahulu.',
            ], 401);
        }

        // ── Guard 2: Otorisasi Role ───────────────────────────────────────────
        // strict: true → tidak ada type coercion (0 == 'admin' = false dengan strict)
        // Pastikan kolom users.role tidak null sebelum dicek
        $userRole = (string) ($user->role ?? '');

        if ($userRole === '' || ! in_array($userRole, $roles, strict: true)) {
            // Log attempt agar admin bisa audit akses ilegal
            Log::warning('[RoleMiddleware] Akses ditolak', [
                'user_id'        => $user->id,
                'user_role'      => $userRole ?: '(kosong)',
                'required_roles' => $roles,
                'url'            => $request->fullUrl(),
                'ip'             => $request->ip(),
            ]);

            // JANGAN kirim detail role ke frontend — informasi internal
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Anda tidak memiliki akses ke resource ini.',
            ], 403);
        }

        return $next($request);
    }
}
