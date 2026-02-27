<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php', // Pastikan route API didaftarkan di sini
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // Mengaktifkan fitur Stateful / Session / Cookie untuk frontend React SPA
        // Ini sangat penting agar fitur Login Sanctum berjalan dengan lancar
        $middleware->statefulApi();

        // Mendaftarkan alias middleware (Sama seperti $routeMiddleware di Kernel lama)
        // Agar bisa dipanggil di routes/api.php dengan format: Route::middleware(['role:admin'])
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {

        // Memaksa Laravel agar selalu mereturn format JSON jika terjadi error/exception
        // (menghindari render halaman HTML default Laravel saat React mencoba fetch data API)
        $exceptions->shouldRenderJsonWhen(function (Request $request, \Throwable $e) {
            if ($request->is('api/*')) {
                return true;
            }
            return $request->expectsJson();
        });
    })->create();
