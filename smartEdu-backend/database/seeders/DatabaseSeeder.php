<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Guru;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\MataPelajaran;
use App\Models\Pengumuman;
use App\Models\Jadwal;
use App\Models\Pembayaran;
use Illuminate\Support\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Admin User
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@edusmart.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // 2. Create Guru Users and Guru (Dibuat lebih dulu agar bisa jadi Wali Kelas)
        $gurus = [
            ['nama' => 'Dra. Siti Nurhaliza', 'email' => 'siti.nurhaliza@edusmart.com', 'nip' => '197801012003122001'],
            ['nama' => 'Ahmad Fauzi, S.Pd', 'email' => 'ahmad.fauzi@edusmart.com', 'nip' => '198205102006041001'],
            ['nama' => 'Dr. Budi Santoso', 'email' => 'budi.santoso@edusmart.com', 'nip' => '197905152005011002'],
            ['nama' => 'Indah Permata, M.Pd', 'email' => 'indah.permata@edusmart.com', 'nip' => '198603202010012001'],
            ['nama' => 'Eko Prasetyo, S.Sos', 'email' => 'eko.prasetyo@edusmart.com', 'nip' => '198709122011011001'],
        ];

        $guruModels = [];
        foreach ($gurus as $index => $guru) {
            $user = User::create([
                'name' => $guru['nama'],
                'email' => $guru['email'],
                'password' => Hash::make('password'),
                'role' => 'guru',
                'email_verified_at' => now(),
            ]);

            $guruModels[] = Guru::create([
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

        // 3. Create Mata Pelajaran
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

        $mapelModels = [];
        foreach ($mataPelajarans as $mapel) {
            $mapelModels[] = MataPelajaran::create(array_merge($mapel, [
                'deskripsi' => 'Mata pelajaran ' . $mapel['nama_mapel'],
                'status' => 'aktif'
            ]));
        }

        // 4. Create Kelas (Memasukkan id Guru sebagai wali_kelas_id)
        $kelasList = [
            ['nama_kelas' => 'X IPA 1', 'tingkat' => 'X', 'tahun_ajaran' => '2024/2025', 'kapasitas' => 30],
            ['nama_kelas' => 'X IPA 2', 'tingkat' => 'X', 'tahun_ajaran' => '2024/2025', 'kapasitas' => 30],
            ['nama_kelas' => 'XI IPA 1', 'tingkat' => 'XI', 'tahun_ajaran' => '2024/2025', 'kapasitas' => 30],
            ['nama_kelas' => 'XII IPA 1', 'tingkat' => 'XII', 'tahun_ajaran' => '2024/2025', 'kapasitas' => 30],
        ];

        $kelasModels = [];
        foreach ($kelasList as $index => $kelas) {
            $kelasModels[] = Kelas::create(array_merge($kelas, [
                'wali_kelas_id' => $guruModels[$index % count($guruModels)]->id, // Assign Wali Kelas
                'status' => 'aktif'
            ]));
        }

        // 5. Create Siswa Users and Siswa
        $siswaCount = 0;
        $siswaModels = [];

        foreach ($kelasModels as $kelas) {
            // Kita buat 5 siswa per kelas sebagai dummy yang cukup
            for ($i = 1; $i <= 5; $i++) {
                $siswaCount++;
                $nisn = '2024' . str_pad($siswaCount, 6, '0', STR_PAD_LEFT);

                $user = User::create([
                    'name' => 'Siswa ' . $siswaCount,
                    'email' => 'siswa' . $siswaCount . '@edusmart.com',
                    'password' => Hash::make('password'),
                    'role' => 'siswa',
                    'email_verified_at' => now(),
                ]);

                $siswaModels[] = Siswa::create([
                    'user_id' => $user->id,
                    'kelas_id' => $kelas->id,
                    'nik' => '320101' . str_pad($siswaCount, 10, '0', STR_PAD_LEFT), // Sesuai migration string(16)
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

        // 6. Create Jadwal (Mengisi Jadwal Hari Ini agar tampil di Dashboard)
        $hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        foreach ($kelasModels as $kelas) {
            foreach ($hariList as $hari) {
                Jadwal::create([
                    'kelas_id' => $kelas->id,
                    'mata_pelajaran_id' => $mapelModels[array_rand($mapelModels)]->id,
                    'guru_id' => $guruModels[array_rand($guruModels)]->id,
                    'hari' => $hari,
                    'jam_mulai' => '07:30:00',
                    'jam_selesai' => '09:00:00',
                    'ruangan' => 'Ruang ' . $kelas->nama_kelas,
                    'semester' => '1',
                    'tahun_ajaran' => '2024/2025',
                    'status' => 'aktif'
                ]);
            }
        }

        // 7. Create Pembayaran (Untuk statistik "Tagihan Lunas" di Dashboard)
        foreach ($siswaModels as $siswa) {
            Pembayaran::create([
                'siswa_id' => $siswa->id,
                'jenis_pembayaran' => 'spp',
                'jumlah' => 500000.00,
                'tanggal_pembayaran' => now()->subDays(rand(1, 10)),
                'tanggal_jatuh_tempo' => now()->startOfMonth()->addDays(9), // Tanggal 10
                'status_pembayaran' => 'sudah_bayar',
                'metode_pembayaran' => 'transfer',
                'keterangan' => 'SPP Lunas'
            ]);
        }

        // 8. Create Pengumuman
        $pengumuman = [
            [
                'judul' => 'Libur Semester Ganjil',
                'isi' => 'Libur semester akan dimulai pada tanggal 20 Januari 2026. Harap para siswa mempersiapkan diri.',
                'tipe' => 'biasa',
                'target_audience' => 'semua',
                'status' => 'aktif',
                'dibuat_oleh' => $admin->id,
                'tanggal_mulai' => now(),
                'tanggal_selesai' => now()->addDays(30),
            ],
            [
                'judul' => 'Ujian Tengah Semester (UTS)',
                'isi' => 'Pelaksanaan UTS akan dimulai pada tanggal 15 Maret 2026. Jadwal lengkap dapat diunduh melalui portal masing-masing.',
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
