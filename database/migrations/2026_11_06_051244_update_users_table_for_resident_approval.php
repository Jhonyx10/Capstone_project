<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Works on any Laravel version, no doctrine/dbal needed
        DB::statement("ALTER TABLE users MODIFY status VARCHAR(20) NOT NULL DEFAULT 'active'");

        Schema::table('users', function (Blueprint $table) {
            $table->string('device_id')->nullable()->index();
            $table->string('id_number_hash')->nullable()->index();
            $table->string('reject_reason')->nullable();
            $table->string('block_reason')->nullable();
            $table->timestamp('blocked_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reviewed_by');
            $table->dropColumn([
                'device_id', 'id_number_hash', 'reject_reason',
                'block_reason', 'blocked_at', 'reviewed_at',
            ]);
        });
    }
};