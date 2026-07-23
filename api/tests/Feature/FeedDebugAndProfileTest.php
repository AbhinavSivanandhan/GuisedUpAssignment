<?php

namespace Tests\Feature;

use App\Jobs\RebuildUserFeedProfile;
use App\Models\Interaction;
use App\Models\Post;
use App\Models\User;
use App\Services\EmbeddingAnalysis;
use App\Services\EmbeddingClient;
use App\Services\Feed\UserFeedProfileCalculator;
use App\Services\Feed\UserFeedProfileService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FeedDebugAndProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_ranking_debug_arithmetic_is_gated_and_matches_components(): void
    {
        config(['feed.debug_enabled' => true]);
        $viewer = $this->user('viewer@example.test');
        $author = $this->user('author@example.test');
        $this->postFor($author, ['authenticity_score' => 0.8]);
        Sanctum::actingAs($viewer);

        $debug = $this->getJson('/api/feed')->assertOk()->json('data.0.ranking_debug');
        $this->assertIsArray($debug);
        $contributions = collect($debug['components'])->sum('contribution');
        $this->assertEqualsWithDelta($debug['final_score'], $contributions, 0.0001);

        config(['feed.debug_enabled' => false]);
        $this->getJson('/api/feed')
            ->assertOk()
            ->assertJsonMissingPath('data.0.ranking_debug');
    }

    public function test_debug_enabled_and_disabled_return_identical_order_and_page_ranks_are_global(): void
    {
        $viewer = $this->user('viewer@example.test');
        $author = $this->user('author@example.test');
        for ($index = 1; $index <= 25; $index++) {
            $this->postFor($author, [
                'text' => "post {$index}",
                'created_at' => now()->subMinutes($index),
            ]);
        }
        Sanctum::actingAs($viewer);

        config(['feed.debug_enabled' => false]);
        $withoutDebug = array_column($this->getJson('/api/feed?page=2')->assertOk()->json('data'), 'id');

        config(['feed.debug_enabled' => true]);
        $withDebug = $this->getJson('/api/feed?page=2')->assertOk()->json('data');

        $this->assertSame($withoutDebug, array_column($withDebug, 'id'));
        $this->assertSame(21, $withDebug[0]['ranking_debug']['rank']);
    }

    public function test_profile_calculator_matches_raw_relationship_and_interest_rules(): void
    {
        $viewer = $this->user('viewer@example.test');
        $closeAuthor = $this->user('close@example.test');
        $weakAuthor = $this->user('weak@example.test');
        $closePost = $this->postFor($closeAuthor, ['embedding' => $this->vectorLiteral(1.0, 0.0)]);
        $weakPost = $this->postFor($weakAuthor, ['embedding' => $this->vectorLiteral(0.0, 1.0)]);

        $viewer->interactions()->create(['post_id' => $closePost->id, 'type' => Interaction::TYPE_REPLY]);
        $viewer->interactions()->create(['post_id' => $weakPost->id, 'type' => Interaction::TYPE_VIEW]);

        $data = app(UserFeedProfileCalculator::class)->calculate($viewer->interactions()->with('post')->get());

        $this->assertSame(2, $data->evidenceCount);
        $this->assertGreaterThan($data->relationshipScores[$weakAuthor->id], $data->relationshipScores[$closeAuthor->id]);
        $this->assertNotNull($data->interestVector);
    }

    public function test_feed_uses_stored_profile_and_dispatches_stale_rebuild_without_blocking(): void
    {
        Queue::fake();
        $viewer = $this->user('viewer@example.test');
        $author = $this->user('author@example.test');
        $post = $this->postFor($author);
        $viewer->interactions()->create(['post_id' => $post->id, 'type' => Interaction::TYPE_VIEW]);
        $viewer->feedProfiles()->create([
            'interest_embedding' => $this->vectorLiteral(1.0, 0.0),
            'relationship_scores' => [$author->id => 1.0],
            'evidence_count' => 1,
            'source_interaction_id' => null,
            'computed_at' => now(),
        ]);
        Sanctum::actingAs($viewer);

        $this->getJson('/api/feed')->assertOk();

        Queue::assertPushed(RebuildUserFeedProfile::class);
    }

    public function test_older_profile_rebuild_snapshot_cannot_overwrite_newer_watermark(): void
    {
        $viewer = $this->user('viewer@example.test');
        $author = $this->user('author@example.test');
        $post = $this->postFor($author);
        $first = $viewer->interactions()->create(['post_id' => $post->id, 'type' => Interaction::TYPE_VIEW]);
        $second = $viewer->interactions()->create(['post_id' => $post->id, 'type' => Interaction::TYPE_REPLY]);

        $viewer->feedProfiles()->create([
            'interest_embedding' => $this->vectorLiteral(1.0, 0.0),
            'relationship_scores' => [$author->id => 1.0],
            'evidence_count' => 2,
            'source_interaction_id' => $second->id,
            'computed_at' => now(),
        ]);

        $olderData = app(UserFeedProfileCalculator::class)->calculate(collect([$first->load('post')]));
        $reflection = new \ReflectionMethod(UserFeedProfileService::class, 'storeProfile');
        $reflection->setAccessible(true);
        $reflection->invoke(app(UserFeedProfileService::class), $viewer, $olderData);

        $this->assertDatabaseHas('user_feed_profiles', [
            'user_id' => $viewer->id,
            'source_interaction_id' => $second->id,
        ]);
    }

    public function test_database_seeder_rerun_reuses_demo_fixtures_without_duplication(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            $this->markTestSkipped('The demo seeder idempotency check relies on PostgreSQL duplicate cleanup SQL.');
        }

        $this->app->bind(EmbeddingClient::class, fn () => new class implements EmbeddingClient {
            public function analyze(string $text, ?string $imageUrl = null): EmbeddingAnalysis
            {
                return new EmbeddingAnalysis(
                    embedding: array_merge([1.0, 0.0], array_fill(0, 382, 0.0)),
                    mode: 'fallback',
                    model: 'test-fallback',
                    textAuthenticityScore: 0.7,
                    imageAuthenticityScore: null,
                    authenticityScore: 0.7,
                    signals: [],
                );
            }
        });

        $this->seed(DatabaseSeeder::class);
        $firstCounts = [
            'users' => User::query()->where('email', 'like', '%@example.test')->count(),
            'posts' => Post::query()->where('text', 'like', 'RANK_EVIDENCE_SEED_20260723%')->count(),
            'interactions' => Interaction::query()->count(),
        ];

        $this->seed(DatabaseSeeder::class);

        $this->assertSame($firstCounts['users'], User::query()->where('email', 'like', '%@example.test')->count());
        $this->assertSame($firstCounts['posts'], Post::query()->where('text', 'like', 'RANK_EVIDENCE_SEED_20260723%')->count());
        $this->assertSame($firstCounts['interactions'], Interaction::query()->count());
    }

    private function user(string $email): User
    {
        return User::query()->create([
            'name' => $email,
            'email' => $email,
            'password' => 'password',
        ]);
    }

    private function postFor(User $author, array $attributes = []): Post
    {
        $createdAt = $attributes['created_at'] ?? now();
        unset($attributes['created_at']);

        $post = $author->posts()->create(array_merge([
            'text' => 'feed post',
            'embedding' => $this->vectorLiteral(1.0, 0.0),
            'text_authenticity_score' => $attributes['authenticity_score'] ?? 0.5,
            'image_authenticity_score' => null,
            'authenticity_score' => $attributes['authenticity_score'] ?? 0.5,
            'embedding_status' => 'fallback',
        ], $attributes));

        $post->created_at = $createdAt;
        $post->updated_at = $createdAt;
        $post->save();

        return $post;
    }

    private function vectorLiteral(float $first, float $second): string
    {
        return '['.implode(',', array_merge([$first, $second], array_fill(0, 382, 0.0))).']';
    }
}
