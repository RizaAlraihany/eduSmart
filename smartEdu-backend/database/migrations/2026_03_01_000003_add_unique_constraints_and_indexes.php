<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Unique constraint absensis ──
        // Satu siswa tidak bisa absen dua kali untuk jadwal + tanggal yang sama
        Schema::table('absensis', function (Blueprint $table) {
            $table->unique(
                ['siswa_id', 'jadwal_id', 'tanggal'],
                'absensi_siswa_jadwal_tanggal_unique'
            );

            // Index untuk query statistik kehadiran per siswa
            $table->index(['siswa_id', 'tanggal'], 'absensi_siswa_tanggal_idx');
            $table->index(['kelas_id', 'tanggal'], 'absensi_kelas_tanggal_idx');
        });

        // ── 2. Unique constraint nilais ──
        // Satu siswa tidak bisa punya dua nilai untuk jenis + mapel + semester + tahun ajaran
        Schema::table('nilais', function (Blueprint $table) {
            $table->unique(
                ['siswa_id', 'mata_pelajaran_id', 'jenis_nilai', 'semester', 'tahun_ajaran'],
                'nilai_siswa_mapel_jenis_semester_unique'
            );

            // Index untuk query rata-rata nilai per siswa
            $table->index(['siswa_id', 'semester', 'tahun_ajaran'], 'nilai_siswa_semester_idx');
        });

        // ── 3. Unique constraint jadwals ──
        // Satu kelas tidak boleh punya dua jadwal di waktu yang sama
        // Satu guru tidak boleh mengajar dua kelas di waktu yang sama
        Schema::table('jadwals', function (Blueprint $table) {
            $table->unique(
                ['kelas_id', 'hari', 'jam_mulai', 'semester', 'tahun_ajaran'],
                'jadwal_kelas_waktu_unique'
            );
            $table->unique(
                ['guru_id', 'hari', 'jam_mulai', 'semester', 'tahun_ajaran'],
                'jadwal_guru_waktu_unique'
            );

            // Index untuk query jadwal hari ini
            $table->index(['kelas_id', 'hari', 'status'], 'jadwal_kelas_hari_idx');
            $table->index(['guru_id', 'hari', 'status'],  'jadwal_guru_hari_idx');
        });
    }

    public function down(): void
    {
        Schema::table('absensis', function (Blueprint $table) {
            $table->dropUnique('absensi_siswa_jadwal_tanggal_unique');
            $table->dropIndex('absensi_siswa_tanggal_idx');
            $table->dropIndex('absensi_kelas_tanggal_idx');
        });

        Schema::table('nilais', function (Blueprint $table) {
            $table->dropUnique('nilai_siswa_mapel_jenis_semester_unique');
            $table->dropIndex('nilai_siswa_semester_idx');
        });

        Schema::table('jadwals', function (Blueprint $table) {
            $table->dropUnique('jadwal_kelas_waktu_unique');
            $table->dropUnique('jadwal_guru_waktu_unique');
            $table->dropIndex('jadwal_kelas_hari_idx');
            $table->dropIndex('jadwal_guru_hari_idx');
        });
    }
};
