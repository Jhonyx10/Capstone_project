<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            // Nullable so existing operations stay valid; deleting a zone just clears it.
            $table->foreignId('zone_id')
                ->nullable()
                ->after('status')
                ->constrained('zones')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('zone_id');
        });
    }
};