<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

// Auth Controllers
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;

// Resource Controllers
use App\Http\Controllers\GuruController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KelasController;
use App\Http\Controllers\MataPelajaranController;
use App\Http\Controllers\JadwalController;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\NilaiController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\PengumumanController;
use App\Http\Controllers\TugasController;

// RATE LIMITER DEFINITIONS

RateLimiter::for('login', function (Request $request) {
    return [
        // per IP: blok brute force / bot scanner
        // 20 attempt/menit per IP, terlepas dari email yang dicoba
        Limit::perMinute(20)->by('ip:' . $request->ip()),

        // per email: blok credential stuffing ke satu akun dari banyak IP
        // 10 attempt/menit per email address
        Limit::perMinute(10)->by('email:' . strtolower($request->input('email', ''))),
    ];
});

RateLimiter::for('api', function (Request $request) {
    // 120 request/menit per user authenticated, fallback ke IP jika belum login
    return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
});

// PUBLIC ROUTES — Tidak perlu login

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('throttle:login')
    ->name('login');

Route::post('/register', [RegisteredUserController::class, 'store'])
    ->name('register');

// PROTECTED ROUTES — Harus login

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Info user yang sedang login
    Route::get('/user', fn(Request $request) => response()->json([
        'success' => true,
        'data'    => $request->user(),
    ]));

    // Logout
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    // DASHBOARD 
    // Single endpoint lama — masih dikonsumsi Dashboard.jsx (jangan hapus)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Dedicated endpoint per role
    Route::get('/dashboard/siswa', [DashboardController::class, 'siswa']);
    Route::get('/dashboard/guru',  [DashboardController::class, 'guru']);
    Route::get('/dashboard/admin', [DashboardController::class, 'admin']);

    // PENGUMUMAN — read: semua role, write: admin only 
    Route::get('/pengumuman',              [PengumumanController::class, 'index'])->name('pengumuman.index');
    Route::get('/pengumuman/{pengumuman}', [PengumumanController::class, 'show'])->name('pengumuman.show');

    Route::middleware(['role:admin'])->group(function () {
        Route::post('/pengumuman',                [PengumumanController::class, 'store'])->name('pengumuman.store');
        Route::put('/pengumuman/{pengumuman}',    [PengumumanController::class, 'update'])->name('pengumuman.update');
        Route::delete('/pengumuman/{pengumuman}', [PengumumanController::class, 'destroy'])->name('pengumuman.destroy');
    });

    // TUGAS — read: semua role, write: admin + guru 
    Route::get('/tugas',         [TugasController::class, 'index'])->name('tugas.index');
    Route::get('/tugas/{tugas}', [TugasController::class, 'show'])->name('tugas.show');

    Route::middleware(['role:admin,guru'])->group(function () {
        Route::post('/tugas',           [TugasController::class, 'store'])->name('tugas.store');
        Route::put('/tugas/{tugas}',    [TugasController::class, 'update'])->name('tugas.update');
        Route::delete('/tugas/{tugas}', [TugasController::class, 'destroy'])->name('tugas.destroy');
    });

    // ADMIN + GURU — jadwal, absensi, nilai 
    Route::middleware(['role:admin,guru'])->group(function () {
        Route::apiResource('/jadwal',  JadwalController::class);
        Route::apiResource('/absensi', AbsensiController::class);
        Route::apiResource('/nilai',   NilaiController::class);
    });

    // ADMIN ONLY data master 
    Route::middleware(['role:admin'])->group(function () {
        Route::apiResource('/siswa',      SiswaController::class);
        Route::apiResource('/guru',       GuruController::class);
        Route::apiResource('/kelas',      KelasController::class);
        Route::apiResource('/mapel',      MataPelajaranController::class);
        Route::apiResource('/pembayaran', PembayaranController::class);
    });
});
