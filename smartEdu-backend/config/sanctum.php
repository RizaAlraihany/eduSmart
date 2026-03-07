<?php

use Laravel\Sanctum\Sanctum;

return [

    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | FIX: Konfigurasi ulang agar SANCTUM_STATEFUL_DOMAINS dari .env
    | terbaca dengan benar, dan localhost:5173 selalu masuk sebagai default.
    |
    | Format SANCTUM_STATEFUL_DOMAINS di .env:
    |   SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000,127.0.0.1:5173
    |
    | TANPA http://, TANPA trailing slash, pisahkan dengan koma.
    |
    */
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', implode(',', [
        'localhost',
        'localhost:3000',
        'localhost:5173',
        '127.0.0.1',
        '127.0.0.1:8000',
        '::1',
        Sanctum::currentApplicationUrlWithPort(),
    ]))),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    */
    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | Untuk SPA (React + Sanctum stateful), expiration token dikontrol oleh
    | SESSION_LIFETIME di .env, bukan dari sini.
    | Key ini hanya berlaku untuk API token (createToken).
    | Set null = ikuti SESSION_LIFETIME.
    |
    */
    'expiration' => env('SANCTUM_TOKEN_EXPIRATION', null),

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    */
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies'      => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token'  => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

];
