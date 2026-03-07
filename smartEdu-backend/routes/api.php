<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
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

// Rate Limiters 

RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(20)->by('ip:' . $request->ip()),
        Limit::perMinute(10)->by('email:' . strtolower($request->input('email', ''))),
    ];
});

RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
});

// Public Routes 

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('throttle:login')
    ->name('login');

Route::post('/register', [RegisteredUserController::class, 'store'])
    ->name('register');

// Protected Routes 

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    Route::get('/user', fn(Request $request) => response()->json([
        'success' => true,
        'data'    => $request->user(),
    ]));

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    // Dashboard
    Route::get('/dashboard',       [DashboardController::class, 'index']);
    Route::get('/dashboard/siswa', [DashboardController::class, 'siswa']);
    Route::get('/dashboard/guru',  [DashboardController::class, 'guru']);
    Route::get('/dashboard/admin', [DashboardController::class, 'admin']);

    // PENGUMUMAN 
    Route::get('/pengumuman',              [PengumumanController::class, 'index'])->name('pengumuman.index');
    Route::get('/pengumuman/{pengumuman}', [PengumumanController::class, 'show'])->name('pengumuman.show');

    Route::middleware(['role:admin'])->group(function () {
        Route::post('/pengumuman',                [PengumumanController::class, 'store'])->name('pengumuman.store');
        Route::put('/pengumuman/{pengumuman}',    [PengumumanController::class, 'update'])->name('pengumuman.update');
        Route::delete('/pengumuman/{pengumuman}', [PengumumanController::class, 'destroy'])->name('pengumuman.destroy');
    });

    // TUGAS 
    Route::get('/tugas',         [TugasController::class, 'index'])->name('tugas.index');
    Route::get('/tugas/{tugas}', [TugasController::class, 'show'])->name('tugas.show');

    Route::middleware(['role:admin,guru'])->group(function () {
        Route::post('/tugas',           [TugasController::class, 'store'])->name('tugas.store');
        Route::put('/tugas/{tugas}',    [TugasController::class, 'update'])->name('tugas.update');
        Route::delete('/tugas/{tugas}', [TugasController::class, 'destroy'])->name('tugas.destroy');
    });

    // JADWAL 
    
    Route::get('/jadwal',          [JadwalController::class, 'index'])->name('jadwal.index');
    Route::get('/jadwal/{jadwal}', [JadwalController::class, 'show'])->name('jadwal.show');

    Route::middleware(['role:admin,guru'])->group(function () {
        Route::post('/jadwal',            [JadwalController::class, 'store'])->name('jadwal.store');
        Route::put('/jadwal/{jadwal}',    [JadwalController::class, 'update'])->name('jadwal.update');
        Route::delete('/jadwal/{jadwal}', [JadwalController::class, 'destroy'])->name('jadwal.destroy');
    });

    // NILAI 
    Route::get('/nilai',         [NilaiController::class, 'index'])->name('nilai.index');
    Route::get('/nilai/{nilai}', [NilaiController::class, 'show'])->name('nilai.show');

    Route::middleware(['role:admin,guru'])->group(function () {
        Route::post('/nilai',           [NilaiController::class, 'store'])->name('nilai.store');
        Route::put('/nilai/{nilai}',    [NilaiController::class, 'update'])->name('nilai.update');
        Route::delete('/nilai/{nilai}', [NilaiController::class, 'destroy'])->name('nilai.destroy');
    });

    // ABSENSI 
    Route::middleware(['role:admin,guru'])->group(function () {
        Route::apiResource('/absensi', AbsensiController::class);
    });

    // PEMBAYARAN 
    Route::get('/pembayaran',              [PembayaranController::class, 'index'])->name('pembayaran.index');
    Route::get('/pembayaran/{pembayaran}', [PembayaranController::class, 'show'])->name('pembayaran.show');

    Route::middleware(['role:admin'])->group(function () {
        Route::post('/pembayaran',                [PembayaranController::class, 'store'])->name('pembayaran.store');
        Route::put('/pembayaran/{pembayaran}',    [PembayaranController::class, 'update'])->name('pembayaran.update');
        Route::delete('/pembayaran/{pembayaran}', [PembayaranController::class, 'destroy'])->name('pembayaran.destroy');
    });

    // ADMIN ONLY — data master 
    Route::middleware(['role:admin'])->group(function () {
        Route::apiResource('/siswa',  SiswaController::class);
        Route::apiResource('/guru',   GuruController::class);
        Route::apiResource('/kelas',  KelasController::class);
        Route::apiResource('/mapel',  MataPelajaranController::class);
    });
});
