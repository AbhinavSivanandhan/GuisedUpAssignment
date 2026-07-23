<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->text('avatar_url')->nullable()->after('email');
        });

        Schema::create('post_reactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'post_id']);
            $table->index(['post_id', 'user_id']);
        });

        DB::table('interactions')
            ->where('type', 'reaction')
            ->select('user_id', 'post_id')
            ->distinct()
            ->orderBy('user_id')
            ->chunk(500, function ($rows): void {
                $now = now();
                $payload = $rows->map(fn ($row): array => [
                    'user_id' => $row->user_id,
                    'post_id' => $row->post_id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all();

                if ($payload !== []) {
                    DB::table('post_reactions')->insertOrIgnore($payload);
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_reactions');

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('avatar_url');
        });
    }
};
