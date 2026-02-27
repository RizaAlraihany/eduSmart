<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Import Auth Controllers
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;

// Import semua controller yang dibutuhkan
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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Di sinilah Anda mendaftarkan rute API untuk aplikasi Anda. Rute ini
| dimuat oleh RouteServiceProvider dalam grup yang memiliki middleware "api".
|
*/

// ============================================================================
// PUBLIC ROUTES (Tidak perlu login)
// ============================================================================

// Route untuk Login & Register
Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->name('login');

Route::post('/register', [RegisteredUserController::class, 'store'])
    ->name('register');

// ============================================================================
// PROTECTED ROUTES (Harus login terlebih dahulu)
// ============================================================================

Route::middleware(['auth:sanctum'])->group(function () {

    // Endpoint untuk mendapatkan data user yang sedang login
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Route Logout
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    // Route Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Route API Resource (Otomatis membuat rute GET, POST, PUT, DELETE)
    Route::apiResource('/guru', GuruController::class);
    Route::apiResource('/siswa', SiswaController::class);
    Route::apiResource('/kelas', KelasController::class);
    Route::apiResource('/mapel', MataPelajaranController::class);
    Route::apiResource('/jadwal', JadwalController::class);
    Route::apiResource('/absensi', AbsensiController::class);
    Route::apiResource('/nilai', NilaiController::class);
    Route::apiResource('/pembayaran', PembayaranController::class);
    Route::apiResource('/pengumuman', PengumumanController::class);
});
