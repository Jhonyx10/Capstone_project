<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at');
            $table->timestamp('ended_at')->nullable(); // null = current assignment
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'ended_at']);
            $table->index(['group_id', 'ended_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_user');
    }
};