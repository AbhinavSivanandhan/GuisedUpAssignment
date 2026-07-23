<?php

namespace Tests\Feature;

use App\Models\Interaction;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FeedRankingTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_feed_is_rejected(): void
    {
        $this->getJson('/api/feed')
            ->assertUnauthorized();
    }

    public function test_feed_returns_20_posts_per_page_with_pagination_metadata(): void
    {
        $viewer = User::query()->create([
            'name' => 'Viewer',
            'email' => 'viewer@example.test',
            'password' => 'password',
        ]);
        $author = User::query()->create([
            'name' => 'Author',
            'email' => 'author@example.test',
            'password' => 'password',
        ]);

        for ($index = 0; $index < 25; $index++) {
            $this->postFor($author, [
                'text' => "post {$index}",
                'created_at' => now()->subMinutes($index),
            ]);
        }

        Sanctum::actingAs($viewer);

        $this->getJson('/api/feed')
            ->assertOk()
            ->assertJsonCount(20, 'data')
            ->assertJsonPath('meta.per_page', 20)
            ->assertJsonPath('meta.total', 25);
    }

    public function test_authenticity_signal_affects_ranking(): void
    {
        $viewer = $this->user('viewer@example.test');
        $author = $this->user('author@example.test');
        $low = $this->postFor($author, ['authenticity_score' => 0.10]);
        $high = $this->postFor($author, ['authenticity_score' => 0.90]);

        Sanctum::actingAs($viewer);

        $ids = $this->feedIds();

        $this->assertLessThan(array_search($low->id, $ids, true), array_search($high->id, $ids, true));
    }

    public function test_relationship_depth_uses_only_authenticated_users_interactions(): void
    {
        $viewer = $this->user('viewer@example.test');
        $otherUser = $this->user('other@example.test');
        $closeAuthor = $this->user('close@example.test');
        $popularAuthor = $this->user('popular@example.test');

        $closePost = $this->postFor($closeAuthor);
        $popularPost = $this->postFor($popularAuthor);

        $viewer->interactions()->create([
            'post_id' => $closePost->id,
            'type' => Interaction::TYPE_REPLY,
        ]);

        for ($index = 0; $index < 5; $index++) {
            $otherUser->interactions()->create([
                'post_id' => $popularPost->id,
                'type' => Interaction::TYPE_REPLY,
            ]);
        }

        Sanctum::actingAs($viewer);

        $ids = $this->feedIds();

        $this->assertLessThan(array_search($popularPost->id, $ids, true), array_search($closePost->id, $ids, true));
    }

    public function test_semantic_similarity_signal_affects_ranking(): void
    {
        $viewer = $this->user('viewer@example.test');
        $author = $this->user('author@example.test');
        $interest = $this->postFor($author, ['embedding' => $this->vectorLiteral(1.0, 0.0)]);
        $similar = $this->postFor($author, ['embedding' => $this->vectorLiteral(0.90, 0.10)]);
        $dissimilar = $this->postFor($author, ['embedding' => $this->vectorLiteral(-1.0, 0.0)]);

        $viewer->interactions()->create([
            'post_id' => $interest->id,
            'type' => Interaction::TYPE_REACTION,
        ]);

        Sanctum::actingAs($viewer);

        $ids = $this->feedIds();

        $this->assertLessThan(array_search($dissimilar->id, $ids, true), array_search($similar->id, $ids, true));
    }

    public function test_time_decay_signal_affects_ranking(): void
    {
        $viewer = $this->user('viewer@example.test');
        $author = $this->user('author@example.test');
        $old = $this->postFor($author, ['created_at' => now()->subDays(30)]);
        $new = $this->postFor($author, ['created_at' => now()]);

        Sanctum::actingAs($viewer);

        $ids = $this->feedIds();

        $this->assertLessThan(array_search($old->id, $ids, true), array_search($new->id, $ids, true));
    }

    public function test_stable_ordering_uses_created_at_then_id_for_equal_scores(): void
    {
        $viewer = $this->user('viewer@example.test');
        $author = $this->user('author@example.test');
        $old = $this->postFor($author, ['created_at' => now()->subHour()]);
        $new = $this->postFor($author, ['created_at' => now()]);

        Sanctum::actingAs($viewer);
        $ids = $this->feedIds();

        $this->assertLessThan(array_search($old->id, $ids, true), array_search($new->id, $ids, true));

        $sameTime = now()->addMinute();
        $lowerId = $this->postFor($author, ['created_at' => $sameTime]);
        $higherId = $this->postFor($author, ['created_at' => $sameTime]);

        $ids = $this->feedIds();

        $this->assertLessThan(array_search($lowerId->id, $ids, true), array_search($higherId->id, $ids, true));
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

    private function feedIds(): array
    {
        return array_column(
            $this->getJson('/api/feed')->assertOk()->json('data'),
            'id'
        );
    }

    private function vectorLiteral(float $first, float $second): string
    {
        return '['.implode(',', array_merge([$first, $second], array_fill(0, 382, 0.0))).']';
    }
}
