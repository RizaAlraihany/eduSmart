<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| File ini sebelumnya digunakan untuk merender view Blade. Sekarang karena
| kita menggunakan React sebagai frontend, kita hanya menyisakan satu
| route dasar untuk memastikan backend Laravel berjalan dengan baik.
|
*/

Route::get('/', function () {
    return response()->json([
        'success' => true,
        'message' => 'SmartEdu API is Running V1.0'
    ]);
});
