<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            // Nullable so existing operations keep working; indexed for the future scheduler query.
            $table->date('event_date')->nullable()->after('status')->index();
        });
    }

    public function down(): void
    {
        Schema::table('operations', function (Blueprint $table) {
            $table->dropIndex(['event_date']);
            $table->dropColumn('event_date');
        });
    }
};