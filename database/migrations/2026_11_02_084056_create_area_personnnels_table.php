<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('area_personnel', function (Blueprint $table) {
            $table->id();
            // Assuming you have a standard 'users' table
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('area_id')->constrained('areas')->onDelete('cascade');
            $table->string('status')->default('active'); // active, inactive, standby
            $table->timestamps();

            // Optional: Prevent assigning the same user to the same area twice concurrently
            $table->unique(['user_id', 'area_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('area_personnel');
    }
};
