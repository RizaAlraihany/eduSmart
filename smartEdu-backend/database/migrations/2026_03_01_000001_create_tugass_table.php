<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tugas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')
                ->constrained('gurus')
                ->onDelete('cascade');
            $table->foreignId('kelas_id')
                ->constrained('kelas')
                ->onDelete('cascade');
            $table->foreignId('mata_pelajaran_id')
                ->constrained('mata_pelajarans')
                ->onDelete('cascade');
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->date('tanggal_diberikan');
            $table->date('tanggal_deadline');
            $table->enum('semester', ['1', '2']);
            $table->string('tahun_ajaran');
            $table->enum('status', ['aktif', 'selesai'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();

            // Index untuk query dashboard guru & siswa
            $table->index(['guru_id', 'status']);
            $table->index(['kelas_id', 'tanggal_deadline']);
        });
    }

    public function down(): void
    {
        // FIX: down() harus drop tabel yang sama dengan up()
        Schema::dropIfExists('tugas');
    }
};
