<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('query_text');
            $table->text('semantic_query');
            $table->string('embedding_mode', 32);
            $table->json('temporal_filter')->nullable();
            $table->json('result_post_ids');
            $table->timestamps();
            $table->index(['user_id', 'created_at']);

            if (DB::getDriverName() !== 'pgsql') {
                $table->text('query_embedding');
            }
        });

        Schema::create('user_feed_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('relationship_scores');
            $table->unsignedInteger('evidence_count')->default(0);
            $table->foreignId('source_interaction_id')->nullable()->constrained('interactions')->nullOnDelete();
            $table->timestamp('computed_at')->nullable();
            $table->timestamps();

            if (DB::getDriverName() !== 'pgsql') {
                $table->text('interest_embedding')->nullable();
            }
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE search_events ADD COLUMN query_embedding vector(384) NOT NULL');
            DB::statement('ALTER TABLE user_feed_profiles ADD COLUMN interest_embedding vector(384) NULL');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_feed_profiles');
        Schema::dropIfExists('search_events');
    }
};
