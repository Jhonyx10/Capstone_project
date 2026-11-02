<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            // Foreign key linking to operations
            $table->foreignId('operation_id')->constrained('operations')->onDelete('cascade');
            $table->string('name'); // e.g., "Post 1", "Zone 3 Checkpoint"
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->json('geofence')->nullable();
            $table->integer('capacity')->default(0); // Max responders allowed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('areas');
    }
};