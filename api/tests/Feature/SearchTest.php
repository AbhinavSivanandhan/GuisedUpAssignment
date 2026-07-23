<?php

namespace Tests\Feature;

use App\Enums\ReactionKind;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_search_is_rejected(): void
    {
        $this->getJson('/api/search?q=travel')
            ->assertUnauthorized();
    }

    public function test_search_validates_query(): void
    {
        Sanctum::actingAs($this->user('viewer@example.test'));

        $this->getJson('/api/search')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['q']);

        $this->getJson('/api/search?q=%20%20%20')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['q']);
    }

    public function test_search_returns_semantic_ranking_order(): void
    {
        $author = $this->user('author@example.test');
        $keywordMatch = $this->postFor($author, [
            'text' => 'travel travel travel exact keyword text',
            'embedding' => $this->vectorLiteral(-1.0, 0.0),
        ]);
        $semanticMatch = $this->postFor($author, [
            'text' => 'different words but matching vector meaning',
            'embedding' => $this->vectorLiteral(1.0, 0.0),
        ]);

        Http::fake([
            '*embedding-service.test/analyze' => Http::response($this->analysisPayload($this->vector(1.0, 0.0)), 200),
        ]);
        Sanctum::actingAs($this->user('viewer@example.test'));

        $ids = array_column(
            $this->getJson('/api/search?q=natural%20language%20travel')
                ->assertOk()
                ->assertJsonPath('meta.limit', 10)
                ->assertJsonPath('meta.embedding_mode', 'fallback')
                ->json('data'),
            'id'
        );

        $this->assertSame([$semanticMatch->id, $keywordMatch->id], $ids);
    }

    public function test_search_hydrates_viewer_reaction_state_and_author_avatar(): void
    {
        $viewer = $this->user('viewer@example.test');
        $otherViewer = $this->user('other-viewer@example.test');
        $author = $this->user('author@example.test', [
            'avatar_url' => 'https://images.example.test/avatar.jpg',
        ]);
        $reacted = $this->postFor($author, ['embedding' => $this->vectorLiteral(1.0, 0.0)]);
        $notReacted = $this->postFor($author, ['embedding' => $this->vectorLiteral(0.9, 0.1)]);
        $viewer->postReactions()->create([
            'post_id' => $reacted->id,
            'reaction_kind' => ReactionKind::GoodVibes->value,
        ]);
        $otherViewer->postReactions()->create([
            'post_id' => $notReacted->id,
            'reaction_kind' => ReactionKind::Support->value,
        ]);

        Http::fake([
            '*embedding-service.test/analyze' => Http::response($this->analysisPayload($this->vector(1.0, 0.0)), 200),
        ]);
        Sanctum::actingAs($viewer);

        $response = $this->getJson('/api/search?q=travel')
            ->assertOk()
            ->assertJsonPath('data.0.author.avatar_url', 'https://images.example.test/avatar.jpg')
            ->json('data');

        $byId = collect($response)->keyBy('id');
        $this->assertTrue($byId[$reacted->id]['viewer_has_reacted']);
        $this->assertSame(ReactionKind::GoodVibes->value, $byId[$reacted->id]['viewer_reaction_kind']);
        $this->assertFalse($byId[$notReacted->id]['viewer_has_reacted']);
        $this->assertNull($byId[$notReacted->id]['viewer_reaction_kind']);
    }

    public function test_search_returns_at_most_10_results(): void
    {
        $author = $this->user('author@example.test');

        for ($index = 0; $index < 12; $index++) {
            $this->postFor($author, ['created_at' => now()->subMinutes($index)]);
        }

        Http::fake([
            '*embedding-service.test/analyze' => Http::response($this->analysisPayload($this->vector(1.0, 0.0)), 200),
        ]);
        Sanctum::actingAs($this->user('viewer@example.test'));

        $this->getJson('/api/search?q=travel')
            ->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.limit', 10);
    }

    public function test_search_applies_last_week_temporal_intent_as_a_date_filter(): void
    {
        Carbon::setTestNow('2026-07-22 12:00:00');

        try {
            $author = $this->user('author@example.test');
            $recent = $this->postFor($author, [
                'text' => 'recent travel story',
                'created_at' => now()->subDays(2),
            ]);
            $old = $this->postFor($author, [
                'text' => 'old travel story',
                'created_at' => now()->subDays(8),
            ]);

            Http::fake([
                '*embedding-service.test/analyze' => Http::response($this->analysisPayload($this->vector(1.0, 0.0)), 200),
            ]);
            Sanctum::actingAs($this->user('viewer@example.test'));

            $ids = array_column(
                $this->getJson('/api/search?q=funny%20travel%20stories%20from%20last%20week')
                    ->assertOk()
                    ->assertJsonPath('meta.temporal_filter.label', 'last_week')
                    ->assertJsonPath('meta.temporal_filter.interpretation', 'trailing_7_days')
                    ->json('data'),
                'id'
            );

            $this->assertSame([$recent->id], $ids);
            $this->assertNotContains($old->id, $ids);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_search_handles_empty_results(): void
    {
        Http::fake([
            '*embedding-service.test/analyze' => Http::response($this->analysisPayload($this->vector(1.0, 0.0)), 200),
        ]);
        Sanctum::actingAs($this->user('viewer@example.test'));

        $this->getJson('/api/search?q=travel')
            ->assertOk()
            ->assertJsonCount(0, 'data')
            ->assertJsonPath('meta.query', 'travel');
    }

    public function test_search_handles_embedding_service_failure(): void
    {
        Http::fake([
            '*embedding-service.test/analyze' => Http::response(['message' => 'down'], 503),
        ]);
        Sanctum::actingAs($this->user('viewer@example.test'));

        $this->getJson('/api/search?q=travel')
            ->assertStatus(503)
            ->assertJsonPath('message', 'Semantic search is unavailable.');
    }

    private function user(string $email, array $attributes = []): User
    {
        return User::query()->create(array_merge([
            'name' => $email,
            'email' => $email,
            'password' => 'password',
        ], $attributes));
    }

    private function postFor(User $author, array $attributes = []): Post
    {
        $createdAt = $attributes['created_at'] ?? now();
        unset($attributes['created_at']);

        $post = $author->posts()->create(array_merge([
            'text' => 'searchable post',
            'embedding' => $this->vectorLiteral(1.0, 0.0),
            'text_authenticity_score' => 0.5,
            'image_authenticity_score' => null,
            'authenticity_score' => 0.5,
            'embedding_status' => 'fallback',
        ], $attributes));

        $post->created_at = $createdAt;
        $post->updated_at = $createdAt;
        $post->save();

        return $post;
    }

    /**
     * @return list<float>
     */
    private function vector(float $first, float $second): array
    {
        return array_merge([$first, $second], array_fill(0, 382, 0.0));
    }

    private function vectorLiteral(float $first, float $second): string
    {
        return '['.implode(',', $this->vector($first, $second)).']';
    }

    /**
     * @param list<float> $embedding
     */
    private function analysisPayload(array $embedding): array
    {
        return [
            'embedding' => $embedding,
            'mode' => 'fallback',
            'model' => 'deterministic-hash-v1',
            'authenticity' => [
                'text_score' => 0.5,
                'image_score' => null,
                'combined_score' => 0.5,
                'signals' => [],
            ],
        ];
    }
}
