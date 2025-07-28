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
        Schema::create('violators_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('incident_reports')->onDelete('cascade');
            $table->foreignId('violator_id')->constrained('violators_profiles')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('violators_records');
    }
};
