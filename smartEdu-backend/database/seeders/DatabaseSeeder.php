<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Guru;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\MataPelajaran;
use App\Models\Pengumuman;
use Illuminate\Support\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@edusmart.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create Mata Pelajaran
        $mataPelajarans = [
            ['nama_mapel' => 'Matematika', 'kode_mapel' => 'MTK', 'kkm' => 75],
            ['nama_mapel' => 'Bahasa Indonesia', 'kode_mapel' => 'BID', 'kkm' => 75],
            ['nama_mapel' => 'Bahasa Inggris', 'kode_mapel' => 'BIG', 'kkm' => 75],
            ['nama_mapel' => 'IPA', 'kode_mapel' => 'IPA', 'kkm' => 75],
            ['nama_mapel' => 'IPS', 'kode_mapel' => 'IPS', 'kkm' => 75],
            ['nama_mapel' => 'PKn', 'kode_mapel' => 'PKN', 'kkm' => 75],
            ['nama_mapel' => 'Pendidikan Agama', 'kode_mapel' => 'PAI', 'kkm' => 75],
            ['nama_mapel' => 'Olahraga', 'kode_mapel' => 'PJK', 'kkm' => 75],
        ];

        foreach ($mataPelajarans as $mapel) {
            MataPelajaran::create(array_merge($mapel, ['status' => 'aktif']));
        }

        // Create Kelas
        $kelasList = [
            ['nama_kelas' => 'X IPA 1', 'tingkat' => 'X', 'tahun_ajaran' => '2024/2025', 'kapasitas' => 30],
            ['nama_kelas' => 'X IPA 2', 'tingkat' => 'X', 'tahun_ajaran' => '2024/2025', 'kapasitas' => 30],
            ['nama_kelas' => 'X IPS 1', 'tingkat' => 'X', 'tahun_ajaran' => '2024/2025', 'kapasitas' => 30],
            ['nama_kelas' => 'XI IPA 1', 'tingkat' => 'XI', 'tahun_ajaran' => '2024/2025', 'kapasitas' => 30],
            ['nama_kelas' => 'XI IPS 1', 'tingkat' => 'XI', 'tahun_ajaran' => '2024/2025', 'kapasitas' => 30],
            ['nama_kelas' => 'XII IPA 1', 'tingkat' => 'XII', 'tahun_ajaran' => '2024/2025', 'kapasitas' => 30],
        ];

        foreach ($kelasList as $kelas) {
            Kelas::create(array_merge($kelas, ['status' => 'aktif']));
        }

        // Create Guru Users and Guru
        $gurus = [
            ['nama' => 'Dra. Siti Nurhaliza', 'email' => 'siti.nurhaliza@edusmart.com', 'nip' => '197801012003122001'],
            ['nama' => 'Ahmad Fauzi, S.Pd', 'email' => 'ahmad.fauzi@edusmart.com', 'nip' => '198205102006041001'],
            ['nama' => 'Dr. Budi Santoso', 'email' => 'budi.santoso@edusmart.com', 'nip' => '197905152005011002'],
            ['nama' => 'Indah Permata, M.Pd', 'email' => 'indah.permata@edusmart.com', 'nip' => '198603202010012001'],
            ['nama' => 'Eko Prasetyo, S.Sos', 'email' => 'eko.prasetyo@edusmart.com', 'nip' => '198709122011011001'],
        ];

        foreach ($gurus as $index => $guru) {
            $user = User::create([
                'name' => $guru['nama'],
                'email' => $guru['email'],
                'password' => Hash::make('password'),
                'role' => 'guru',
                'email_verified_at' => now(),
            ]);

            Guru::create([
                'user_id' => $user->id,
                'nama' => $guru['nama'],
                'email' => $guru['email'],
                'nip' => $guru['nip'],
                'alamat' => 'Jl. Pendidikan No. ' . ($index + 1) . ', Jakarta',
                'telepon' => '081234567' . str_pad($index, 3, '0', STR_PAD_LEFT),
                'tanggal_lahir' => Carbon::now()->subYears(rand(30, 50))->format('Y-m-d'),
                'jenis_kelamin' => $index % 2 == 0 ? 'P' : 'L',
                'pendidikan_terakhir' => 'S1',
                'status' => 'aktif',
            ]);
        }

        // Create Siswa Users and Siswa
        $kelasModels = Kelas::all();
        $siswaCount = 0;

        foreach ($kelasModels as $kelas) {
            for ($i = 1; $i <= 25; $i++) {
                $siswaCount++;
                $nisn = '2024' . str_pad($siswaCount, 6, '0', STR_PAD_LEFT);

                $user = User::create([
                    'name' => 'Siswa ' . $siswaCount,
                    'email' => 'siswa' . $siswaCount . '@edusmart.com',
                    'password' => Hash::make('password'),
                    'role' => 'siswa',
                    'email_verified_at' => now(),
                ]);

                Siswa::create([
                    'user_id' => $user->id,
                    'kelas_id' => $kelas->id,
                    'nisn' => $nisn,
                    'nama' => 'Siswa ' . $siswaCount,
                    'email' => 'siswa' . $siswaCount . '@edusmart.com',
                    'alamat' => 'Jl. Siswa No. ' . $siswaCount . ', Jakarta',
                    'telepon' => '081234567' . str_pad($siswaCount, 3, '0', STR_PAD_LEFT),
                    'tanggal_lahir' => Carbon::now()->subYears(rand(16, 18))->format('Y-m-d'),
                    'jenis_kelamin' => $siswaCount % 2 == 0 ? 'P' : 'L',
                    'nama_orang_tua' => 'Orang Tua Siswa ' . $siswaCount,
                    'telepon_orang_tua' => '081234567' . str_pad($siswaCount + 1000, 3, '0', STR_PAD_LEFT),
                    'status' => 'aktif',
                ]);
            }
        }

        // Create Pengumuman
        $pengumuman = [
            [
                'judul' => 'Libur Semester',
                'isi' => 'Libur semester akan dimulai tanggal 20 Januari 2024.',
                'tipe' => 'biasa',
                'target_audience' => 'semua',
                'status' => 'aktif',
                'dibuat_oleh' => $admin->id,
                'tanggal_mulai' => now(),
                'tanggal_selesai' => now()->addDays(30),
            ],
            [
                'judul' => 'Ujian Tengah Semester',
                'isi' => 'UTS akan dilaksanakan mulai tanggal 25 Januari 2024.',
                'tipe' => 'penting',
                'target_audience' => 'siswa',
                'status' => 'aktif',
                'dibuat_oleh' => $admin->id,
                'tanggal_mulai' => now(),
                'tanggal_selesai' => now()->addDays(30),
            ],
        ];

        foreach ($pengumuman as $item) {
            Pengumuman::create($item);
        }
    }
}
