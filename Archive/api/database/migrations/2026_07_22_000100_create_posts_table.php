<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('text');
            $table->text('image_url')->nullable();
            $table->decimal('text_authenticity_score', 5, 4);
            $table->decimal('image_authenticity_score', 5, 4)->nullable();
            $table->decimal('authenticity_score', 5, 4);
            $table->string('embedding_status', 16)->default('ready');
            if (DB::getDriverName() !== 'pgsql') {
                $table->text('embedding');
            }
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
            $table->index('created_at');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE posts ADD COLUMN embedding vector(384) NOT NULL');
            DB::statement("ALTER TABLE posts ADD CONSTRAINT posts_embedding_status_check CHECK (embedding_status in ('ready', 'fallback', 'failed'))");
            DB::statement('CREATE INDEX posts_embedding_cosine_idx ON posts USING hnsw (embedding vector_cosine_ops)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
