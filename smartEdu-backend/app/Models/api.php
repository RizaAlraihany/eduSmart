<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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

// ============================================================================
// PUBLIC ROUTES — Tidak perlu login
// ============================================================================

Route::post('/login',    [AuthenticatedSessionController::class, 'store'])->name('login');
Route::post('/register', [RegisteredUserController::class, 'store'])->name('register');

// ============================================================================
// PROTECTED ROUTES — Harus login
// ============================================================================

Route::middleware(['auth:sanctum'])->group(function () {

    // Info user yang sedang login
    Route::get('/user', fn(Request $request) => response()->json([
        'success' => true,
        'data'    => $request->user(),
    ]));

    // Logout
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    // Dashboard — semua role bisa akses, controller yang filter per role
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ── PENGUMUMAN — read: semua role, write: admin only ──────────────────────
    Route::get('/pengumuman',             [PengumumanController::class, 'index'])->name('pengumuman.index');
    Route::get('/pengumuman/{pengumuman}',[PengumumanController::class, 'show'])->name('pengumuman.show');

    Route::middleware(['role:admin'])->group(function () {
        Route::post('/pengumuman',                    [PengumumanController::class, 'store'])->name('pengumuman.store');
        Route::put('/pengumuman/{pengumuman}',         [PengumumanController::class, 'update'])->name('pengumuman.update');
        Route::delete('/pengumuman/{pengumuman}',      [PengumumanController::class, 'destroy'])->name('pengumuman.destroy');
    });

    // ── TUGAS — read: semua role (difilter di controller), write: admin + guru ─
    Route::get('/tugas',          [TugasController::class, 'index'])->name('tugas.index');
    Route::get('/tugas/{tugas}',  [TugasController::class, 'show'])->name('tugas.show');

    Route::middleware(['role:admin,guru'])->group(function () {
        Route::post('/tugas',              [TugasController::class, 'store'])->name('tugas.store');
        Route::put('/tugas/{tugas}',       [TugasController::class, 'update'])->name('tugas.update');
        Route::delete('/tugas/{tugas}',    [TugasController::class, 'destroy'])->name('tugas.destroy');
    });

    // ── ADMIN + GURU — jadwal, absensi, nilai ────────────────────────────────
    Route::middleware(['role:admin,guru'])->group(function () {
        Route::apiResource('/jadwal',  JadwalController::class);
        Route::apiResource('/absensi', AbsensiController::class);
        Route::apiResource('/nilai',   NilaiController::class);
    });

    // ── ADMIN ONLY — data master ──────────────────────────────────────────────
    Route::middleware(['role:admin'])->group(function () {
        Route::apiResource('/siswa',      SiswaController::class);
        Route::apiResource('/guru',       GuruController::class);
        Route::apiResource('/kelas',      KelasController::class);
        Route::apiResource('/mapel',      MataPelajaranController::class);
        Route::apiResource('/pembayaran', PembayaranController::class);
    });
});
