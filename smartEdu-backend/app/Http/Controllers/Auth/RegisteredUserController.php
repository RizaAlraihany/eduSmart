<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * POST /api/register
     * Registrasi mandiri siswa baru.
     * NIK sebagai identitas unik — jika sudah terdaftar, tidak bisa daftar ulang.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            // ── Identitas ───────────────────────────────────────────
            'nik'               => ['required', 'string', 'size:16', 'unique:siswas,nik'],
            'nisn'              => ['required', 'string', 'max:20', 'unique:siswas,nisn'],
            'nama'              => ['required', 'string', 'max:255'],
            'jenis_kelamin'     => ['required', 'in:L,P'],
            'tanggal_lahir'     => ['required', 'date', 'before:today'],
            'telepon'           => ['nullable', 'string', 'max:20'],
            'alamat'            => ['nullable', 'string'],

            // ── Orang tua ────────────────────────────────────────────
            'nama_orang_tua'    => ['nullable', 'string', 'max:255'],
            'telepon_orang_tua' => ['nullable', 'string', 'max:20'],

            // ── Akun ─────────────────────────────────────────────────
            'email'             => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email', 'unique:siswas,email'],
            'password'          => ['required', 'confirmed', Rules\Password::defaults()],

            // kelas_id nullable — ditentukan sekolah setelah verifikasi
            'kelas_id'          => ['nullable', 'exists:kelas,id'],
        ], [
            'nik.required'       => 'NIK wajib diisi.',
            'nik.size'           => 'NIK harus 16 digit.',
            'nik.unique'         => 'NIK ini sudah terdaftar. Hubungi admin jika ada masalah.',
            'nisn.unique'        => 'NISN ini sudah terdaftar.',
            'email.unique'       => 'Email ini sudah digunakan.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        DB::beginTransaction();
        try {
            // 1. Buat akun user
            $user = User::create([
                'name'     => $request->nama,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'siswa',
            ]);

            // 2. Buat profil siswa
            $siswa = Siswa::create([
                'user_id'           => $user->id,
                'kelas_id'          => $request->kelas_id ?? null,
                'nik'               => $request->nik,
                'nisn'              => $request->nisn,
                'nama'              => $request->nama,
                'email'             => $request->email,
                'telepon'           => $request->telepon,
                'alamat'            => $request->alamat,
                'tanggal_lahir'     => $request->tanggal_lahir,
                'jenis_kelamin'     => $request->jenis_kelamin,
                'nama_orang_tua'    => $request->nama_orang_tua,
                'telepon_orang_tua' => $request->telepon_orang_tua,
                'status'            => 'aktif',
            ]);

            event(new Registered($user));

            // 3. Auto login setelah register
            Auth::login($user);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil. Selamat datang di eduSmart!',
                'data'    => [
                    'user'  => $user,
                    'siswa' => $siswa->load('kelas'),
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat registrasi. Coba lagi.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
