<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Tambah tugas_id ke nilais (nullable agar tidak break data lama) ──
        Schema::table('nilais', function (Blueprint $table) {
            $table->foreignId('tugas_id')
                  ->nullable()
                  ->after('guru_id')
                  ->constrained('tugass')
                  ->onDelete('set null');
        });

        // Tambah PTS ke enum jenis_nilai ──
        // MySQL tidak support ALTER COLUMN ENUM secara langsung via Blueprint,
        // harus pakai raw statement
        DB::statement("
            ALTER TABLE nilais
            MODIFY COLUMN jenis_nilai
            ENUM('tugas','pts','uts','uas','praktek','harian') NOT NULL
        ");

        // Tambah softDeletes ke semua tabel bisnis utama ──
        Schema::table('siswas', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('gurus', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('nilais', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('absensis', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('pembayarans', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('tugass', function (Blueprint $table) {
            // sudah ada di create migration, skip
        });
    }

    public function down(): void
    {
        // Hapus tugas_id dari nilais
        Schema::table('nilais', function (Blueprint $table) {
            $table->dropForeign(['tugas_id']);
            $table->dropColumn('tugas_id');
        });

        // Rollback enum ke versi lama
        DB::statement("
            ALTER TABLE nilais
            MODIFY COLUMN jenis_nilai
            ENUM('tugas','uts','uas','praktek','harian') NOT NULL
        ");

        // Hapus softDeletes
        Schema::table('siswas',      fn($t) => $t->dropSoftDeletes());
        Schema::table('gurus',       fn($t) => $t->dropSoftDeletes());
        Schema::table('nilais',      fn($t) => $t->dropSoftDeletes());
        Schema::table('absensis',    fn($t) => $t->dropSoftDeletes());
        Schema::table('pembayarans', fn($t) => $t->dropSoftDeletes());
    }
};
