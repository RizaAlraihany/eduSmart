<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            $table->string('action');                      // 'login', 'tambah_siswa', 'input_nilai', dll
            $table->string('model_type')->nullable();      // 'Siswa', 'Nilai', 'Guru'
            $table->unsignedBigInteger('model_id')->nullable(); // ID record yang diaksi
            $table->text('description')->nullable();       // detail human-readable
            $table->string('ip_address', 45)->nullable();

            // Hanya created_at, tidak perlu updated_at karena log tidak pernah diupdate
            $table->timestamp('created_at')->useCurrent();

            // Index untuk query admin dashboard (log terbaru per user, per model)
            $table->index(['user_id', 'created_at'],       'log_user_time_idx');
            $table->index(['model_type', 'model_id'],      'log_model_idx');
            $table->index('created_at',                    'log_time_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
