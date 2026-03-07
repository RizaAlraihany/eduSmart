<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * FIX migration: update_nilais_and_add_softdeletes
 *
 * Migration lama pakai: ->constrained('tugass')
 * Sekarang tabel sudah direname ke 'tugas', jadi foreign key harus
 * constrained('tugas').
 *
 * PENTING: File ini menggantikan:
 *   2026_03_01_000002_update_nilais_and_add_softdeletes.php
 */
return new class extends Migration
{
    public function up(): void
    {
        // Tambah tugas_id ke nilais — constrained ke 'tugas' (bukan 'tugass')
        Schema::table('nilais', function (Blueprint $table) {
            $table->foreignId('tugas_id')
                ->nullable()
                ->after('guru_id')
                ->constrained('tugas')        // FIX: was 'tugass'
                ->onDelete('set null');
        });

        // Tambah PTS ke enum jenis_nilai
        DB::statement("
            ALTER TABLE nilais
            MODIFY COLUMN jenis_nilai
            ENUM('tugas','pts','uts','uas','praktek','harian') NOT NULL
        ");

        // Tambah softDeletes ke tabel bisnis utama
        Schema::table('siswas', function (Blueprint $table) {
            if (! Schema::hasColumn('siswas', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('gurus', function (Blueprint $table) {
            if (! Schema::hasColumn('gurus', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('nilais', function (Blueprint $table) {
            if (! Schema::hasColumn('nilais', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('absensis', function (Blueprint $table) {
            if (! Schema::hasColumn('absensis', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('pembayarans', function (Blueprint $table) {
            if (! Schema::hasColumn('pembayarans', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('nilais', function (Blueprint $table) {
            $table->dropForeign(['tugas_id']);
            $table->dropColumn('tugas_id');
        });

        DB::statement("
            ALTER TABLE nilais
            MODIFY COLUMN jenis_nilai
            ENUM('tugas','uts','uas','praktek','harian') NOT NULL
        ");

        Schema::table('siswas',      fn($t) => $t->dropSoftDeletes());
        Schema::table('gurus',       fn($t) => $t->dropSoftDeletes());
        Schema::table('nilais',      fn($t) => $t->dropSoftDeletes());
        Schema::table('absensis',    fn($t) => $t->dropSoftDeletes());
        Schema::table('pembayarans', fn($t) => $t->dropSoftDeletes());
    }
};
