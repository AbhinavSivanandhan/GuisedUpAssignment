<?php

use App\Enums\ReactionKind;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interactions', function (Blueprint $table) {
            $table->string('reaction_kind')->nullable()->after('type');
            $table->index(['type', 'reaction_kind']);
        });

        Schema::table('post_reactions', function (Blueprint $table) {
            $table->string('reaction_kind')->default(ReactionKind::Like->value)->after('post_id');
            $table->index(['reaction_kind']);
        });

        DB::table('post_reactions')
            ->whereNull('reaction_kind')
            ->update(['reaction_kind' => ReactionKind::Like->value]);
    }

    public function down(): void
    {
        Schema::table('post_reactions', function (Blueprint $table) {
            $table->dropIndex(['reaction_kind']);
            $table->dropColumn('reaction_kind');
        });

        Schema::table('interactions', function (Blueprint $table) {
            $table->dropIndex(['type', 'reaction_kind']);
            $table->dropColumn('reaction_kind');
        });
    }
};
