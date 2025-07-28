<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('incident_response_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('incident_request_responses')->onDelete('cascade');
            $table->foreignId('report_id')->constrained('incident_reports')->onDelete('cascade');
            $table->string('distance');
            $table->string('response_time');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incident_response_records');
    }
};
