<?php

use Laravel\Sanctum\Sanctum;

return [

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s%s',
        'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,::1',
        Sanctum::currentApplicationUrlWithPort(),
        env('APP_URL') ? ',' . parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    | Sebelum: null (token hidup selamanya) — TIDAK AMAN untuk production.
    |
    | Strategi expiration untuk eduSmart:
    | - SPA (session/cookie Sanctum): expiration dikontrol oleh SESSION_LIFETIME
    |   di .env, bukan dari sini. Key ini hanya berlaku untuk API token (createToken).
    | - Jika ada mobile app / API token di masa depan: set 'expiration' => 10080 (7 hari)
    |
    | Untuk SPA murni (React + Sanctum stateful), set ke null tapi kendalikan
    | lewat SESSION_LIFETIME di .env.
    |--------------------------------------------------------------------------
    */
    'expiration' => env('SANCTUM_TOKEN_EXPIRATION', null),

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies'      => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token'  => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

];
