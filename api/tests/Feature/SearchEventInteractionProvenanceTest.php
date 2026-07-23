<?php

namespace Tests\Feature;

use App\Models\Interaction;
use App\Models\Post;
use App\Models\SearchEvent;
use App\Models\User;
use App\Services\PgVector;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SearchEventInteractionProvenanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_non_empty_search_creates_owned_search_event(): void
    {
        $viewer = $this->user('viewer@example.test');
        $author = $this->user('author@example.test');
        $post = $this->postFor($author);
        Http::fake(['*embedding-service.test/analyze' => Http::response($this->analysisPayload(), 200)]);
        Sanctum::actingAs($viewer);

        $eventId = $this->getJson('/api/search?q=travel')
            ->assertOk()
            ->assertJsonPath('data.0.id', $post->id)
            ->json('meta.search_event_id');

        $this->assertDatabaseHas('search_events', [
            'id' => $eventId,
            'user_id' => $viewer->id,
            'query_text' => 'travel',
            'semantic_query' => 'travel',
        ]);
    }

    public function test_empty_search_does_not_create_search_event(): void
    {
        Http::fake(['*embedding-service.test/analyze' => Http::response($this->analysisPayload(), 200)]);
        Sanctum::actingAs($this->user('viewer@example.test'));

        $this->getJson('/api/search?q=travel')
            ->assertOk()
            ->assertJsonPath('meta.search_event_id', null);

        $this->assertDatabaseCount('search_events', 0);
    }

    public function test_search_interaction_requires_owned_event_and_returned_post(): void
    {
        $viewer = $this->user('viewer@example.test');
        $other = $this->user('other@example.test');
        $author = $this->user('author@example.test');
        $returnedPost = $this->postFor($author, ['text' => 'returned']);
        $missingPost = $this->postFor($author, ['text' => 'missing']);
        $event = $this->searchEvent($viewer, [$returnedPost->id]);
        $otherEvent = $this->searchEvent($other, [$returnedPost->id]);
        Sanctum::actingAs($viewer);

        $this->postJson('/api/interactions', [
            'post_id' => $returnedPost->id,
            'type' => Interaction::TYPE_VIEW,
            'source' => Interaction::SOURCE_SEARCH,
            'search_event_id' => $otherEvent->id,
            'visible_duration_ms' => 1500,
        ])->assertUnprocessable();

        $this->postJson('/api/interactions', [
            'post_id' => $missingPost->id,
            'type' => Interaction::TYPE_VIEW,
            'source' => Interaction::SOURCE_SEARCH,
            'search_event_id' => $event->id,
            'visible_duration_ms' => 1500,
        ])->assertUnprocessable();

        $this->postJson('/api/interactions', [
            'post_id' => $returnedPost->id,
            'type' => Interaction::TYPE_VIEW,
            'source' => Interaction::SOURCE_SEARCH,
            'search_event_id' => $event->id,
            'visible_duration_ms' => 1500,
        ])->assertCreated();
    }

    public function test_visible_duration_is_only_allowed_for_views_and_existing_reactions_still_work(): void
    {
        $viewer = $this->user('viewer@example.test');
        $author = $this->user('author@example.test');
        $post = $this->postFor($author);
        Sanctum::actingAs($viewer);

        $this->postJson('/api/interactions', [
            'post_id' => $post->id,
            'type' => Interaction::TYPE_REACTION,
            'visible_duration_ms' => 1500,
        ])->assertUnprocessable();

        $this->postJson('/api/interactions', [
            'post_id' => $post->id,
            'type' => Interaction::TYPE_REACTION,
        ])->assertCreated()
            ->assertJsonPath('data.source', Interaction::SOURCE_FEED);

        $this->assertDatabaseHas('post_reactions', [
            'user_id' => $viewer->id,
            'post_id' => $post->id,
        ]);
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
        return $author->posts()->create(array_merge([
            'text' => 'searchable post',
            'embedding' => $this->vectorLiteral(1.0, 0.0),
            'text_authenticity_score' => 0.5,
            'image_authenticity_score' => null,
            'authenticity_score' => 0.5,
            'embedding_status' => 'fallback',
        ], $attributes));
    }

    private function searchEvent(User $user, array $resultPostIds): SearchEvent
    {
        return $user->searchEvents()->create([
            'query_text' => 'travel',
            'semantic_query' => 'travel',
            'query_embedding' => PgVector::literal(array_merge([1.0, 0.0], array_fill(0, 382, 0.0))),
            'embedding_mode' => 'fallback',
            'temporal_filter' => null,
            'result_post_ids' => $resultPostIds,
        ]);
    }

    private function vectorLiteral(float $first, float $second): string
    {
        return '['.implode(',', array_merge([$first, $second], array_fill(0, 382, 0.0))).']';
    }

    private function analysisPayload(): array
    {
        return [
            'embedding' => array_merge([1.0, 0.0], array_fill(0, 382, 0.0)),
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
