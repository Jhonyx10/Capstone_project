<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE incident_request_responses
            MODIFY COLUMN status
            ENUM('pending', 'ongoing', 'cancel', 'done', 'no_response')
            NOT NULL DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        // Rows using the new value must be moved first, or shrinking the enum will fail
        DB::table('incident_request_responses')
            ->where('status', 'no_response')
            ->update(['status' => 'cancel']);

        DB::statement("
            ALTER TABLE incident_request_responses
            MODIFY COLUMN status
            ENUM('pending', 'ongoing', 'cancel', 'done')
            NOT NULL DEFAULT 'pending'
        ");
    }
};