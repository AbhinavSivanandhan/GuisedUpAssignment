<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interactions', function (Blueprint $table): void {
            $table->string('source', 16)->default('feed')->after('reaction_kind');
            $table->foreignId('search_event_id')->nullable()->after('source')->constrained('search_events')->nullOnDelete();
            $table->unsignedInteger('visible_duration_ms')->nullable()->after('search_event_id');
            $table->index(['user_id', 'id']);
            $table->index(['source', 'search_event_id']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE interactions ADD CONSTRAINT interactions_source_check CHECK (source in ('feed', 'search'))");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE interactions DROP CONSTRAINT IF EXISTS interactions_source_check');
        }

        Schema::table('interactions', function (Blueprint $table): void {
            $table->dropIndex(['source', 'search_event_id']);
            $table->dropIndex(['user_id', 'id']);
            $table->dropConstrainedForeignId('search_event_id');
            $table->dropColumn(['source', 'visible_duration_ms']);
        });
    }
};
