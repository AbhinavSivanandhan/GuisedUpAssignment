<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->string('type', 16);
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'post_id', 'type']);
            $table->index(['post_id', 'type', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE interactions ADD CONSTRAINT interactions_type_check CHECK (type in ('view', 'reply', 'reaction'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('interactions');
    }
};
