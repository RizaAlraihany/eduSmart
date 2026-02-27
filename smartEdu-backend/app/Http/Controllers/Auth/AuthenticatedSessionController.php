<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request (Login).
     */
    public function store(LoginRequest $request): JsonResponse
    {
        // LoginRequest akan mengurus proses validasi email/password dan rate limiting bawaan Laravel
        $request->authenticate();

        // Meregenerasi session untuk mencegah session fixation attacks
        $request->session()->regenerate();

        // Mengembalikan data user yang sedang login dalam format JSON
        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => $request->user()
            ]
        ], 200);
    }

    /**
     * Destroy an authenticated session (Logout).
     */
    public function destroy(Request $request): JsonResponse
    {
        // Logout user dari guard 'web' (karena Sanctum SPA menggunakan guard web + session cookie)
        Auth::guard('web')->logout();

        // Invalidate session
        $request->session()->invalidate();

        // Regenerate CSRF token
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ], 200);
    }
}