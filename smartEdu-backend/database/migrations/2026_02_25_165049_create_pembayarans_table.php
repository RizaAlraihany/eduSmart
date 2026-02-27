<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembayarans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswas')->onDelete('cascade');
            $table->enum('jenis_pembayaran', ['spp', 'daftar_ulang', 'seragam', 'buku', 'kegiatan', 'lainnya']);
            $table->decimal('jumlah', 15, 2);
            $table->datetime('tanggal_pembayaran')->nullable();
            $table->date('tanggal_jatuh_tempo');
            $table->enum('status_pembayaran', ['belum_bayar', 'sudah_bayar', 'terlambat'])->default('belum_bayar');
            $table->enum('metode_pembayaran', ['tunai', 'transfer', 'debit', 'kredit'])->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayarans');
    }
};
