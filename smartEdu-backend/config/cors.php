<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    /*
     * Menentukan path mana saja yang akan diterapkan aturan CORS ini.
     * Kita izinkan semua route API dan route CSRF cookie untuk Sanctum.
     */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    /*
     * Mengizinkan semua HTTP method (GET, POST, PUT, DELETE, dll).
     */
    'allowed_methods' => ['*'],

    /*
     * Menarik URL Frontend dari file .env yang sudah kita atur sebelumnya.
     * Jika tidak ada di .env, akan fallback ke http://localhost:5173.
     */
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],

    'allowed_origins_patterns' => [],

    /*
     * Mengizinkan semua headers dikirim dari frontend.
     */
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    /*
     * Wajib diset 'true' agar Laravel mengizinkan pengiriman kredensial
     * seperti cookie atau header otorisasi (sangat krusial untuk fitur Login SPA Sanctum).
     */
    'supports_credentials' => true,

];
