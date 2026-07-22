<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InteractionCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_interaction_creation_is_rejected(): void
    {
        $this->postJson('/api/interactions', ['post_id' => 1, 'type' => 'view'])
            ->assertUnauthorized();
    }

    public function test_invalid_interaction_types_are_rejected(): void
    {
        [$user, $post] = $this->userAndPost();
        Sanctum::actingAs($user);

        $this->postJson('/api/interactions', ['post_id' => $post->id, 'type' => 'like'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['type']);
    }

    public function test_valid_interaction_is_persisted(): void
    {
        [$user, $post] = $this->userAndPost();
        Sanctum::actingAs($user);

        $this->postJson('/api/interactions', ['post_id' => $post->id, 'type' => 'reply'])
            ->assertCreated()
            ->assertJsonPath('data.post_id', $post->id)
            ->assertJsonPath('data.type', 'reply');

        $this->assertDatabaseHas('interactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'reply',
        ]);
    }

    public function test_missing_post_is_rejected(): void
    {
        Sanctum::actingAs(User::query()->create([
            'name' => 'Alex',
            'email' => 'alex@example.test',
            'password' => 'password',
        ]));

        $this->postJson('/api/interactions', ['post_id' => 999, 'type' => 'view'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['post_id']);
    }

    public function test_repeated_raw_interactions_are_preserved(): void
    {
        [$user, $post] = $this->userAndPost();
        Sanctum::actingAs($user);

        $this->postJson('/api/interactions', ['post_id' => $post->id, 'type' => 'view'])
            ->assertCreated();
        $this->postJson('/api/interactions', ['post_id' => $post->id, 'type' => 'view'])
            ->assertCreated();

        $this->assertDatabaseCount('interactions', 2);
    }

    private function userAndPost(): array
    {
        $author = User::query()->create([
            'name' => 'Author',
            'email' => 'author@example.test',
            'password' => 'password',
        ]);
        $actor = User::query()->create([
            'name' => 'Actor',
            'email' => 'actor@example.test',
            'password' => 'password',
        ]);

        $post = $author->posts()->create([
            'text' => 'hello',
            'embedding' => '['.implode(',', array_fill(0, 384, '0.01')).']',
            'text_authenticity_score' => 0.5,
            'image_authenticity_score' => null,
            'authenticity_score' => 0.5,
            'embedding_status' => 'fallback',
        ]);

        return [$actor, $post];
    }
}
