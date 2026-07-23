<?php

namespace Tests\Feature;

use App\Enums\ReactionKind;
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

    public function test_reaction_interaction_activates_current_reaction_state_idempotently(): void
    {
        [$user, $post] = $this->userAndPost();
        Sanctum::actingAs($user);

        $this->postJson('/api/interactions', ['post_id' => $post->id, 'type' => 'reaction'])
            ->assertCreated();
        $this->postJson('/api/interactions', ['post_id' => $post->id, 'type' => 'reaction'])
            ->assertCreated();

        $this->assertDatabaseCount('interactions', 2);
        $this->assertDatabaseCount('post_reactions', 1);
        $this->assertDatabaseHas('post_reactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'reaction_kind' => ReactionKind::Like->value,
        ]);
    }

    public function test_reaction_kind_defaults_to_like_for_older_clients(): void
    {
        [$user, $post] = $this->userAndPost();
        Sanctum::actingAs($user);

        $this->postJson('/api/interactions', ['post_id' => $post->id, 'type' => 'reaction'])
            ->assertCreated()
            ->assertJsonPath('data.reaction_kind', ReactionKind::Like->value);

        $this->assertDatabaseHas('interactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => 'reaction',
            'reaction_kind' => ReactionKind::Like->value,
        ]);
    }

    public function test_supported_reaction_kinds_are_accepted(): void
    {
        [$user, $post] = $this->userAndPost();
        Sanctum::actingAs($user);

        foreach (ReactionKind::values() as $kind) {
            $this->postJson('/api/interactions', [
                'post_id' => $post->id,
                'type' => 'reaction',
                'reaction_kind' => $kind,
            ])
                ->assertCreated()
                ->assertJsonPath('data.reaction_kind', $kind);

            $this->assertDatabaseHas('post_reactions', [
                'user_id' => $user->id,
                'post_id' => $post->id,
                'reaction_kind' => $kind,
            ]);
        }

        $this->assertDatabaseCount('interactions', 3);
        $this->assertDatabaseCount('post_reactions', 1);
    }

    public function test_invalid_reaction_kind_is_rejected(): void
    {
        [$user, $post] = $this->userAndPost();
        Sanctum::actingAs($user);

        $this->postJson('/api/interactions', [
            'post_id' => $post->id,
            'type' => 'reaction',
            'reaction_kind' => 'clap',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['reaction_kind']);
    }

    public function test_switching_reaction_kind_preserves_raw_history_and_updates_current_state(): void
    {
        [$user, $post] = $this->userAndPost();
        Sanctum::actingAs($user);

        $this->postJson('/api/interactions', [
            'post_id' => $post->id,
            'type' => 'reaction',
            'reaction_kind' => ReactionKind::Support->value,
        ])->assertCreated();

        $this->postJson('/api/interactions', [
            'post_id' => $post->id,
            'type' => 'reaction',
            'reaction_kind' => ReactionKind::GoodVibes->value,
        ])->assertCreated();

        $this->assertDatabaseCount('interactions', 2);
        $this->assertDatabaseCount('post_reactions', 1);
        $this->assertDatabaseHas('post_reactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'reaction_kind' => ReactionKind::GoodVibes->value,
        ]);
    }

    public function test_reaction_undo_requires_authentication(): void
    {
        [, $post] = $this->userAndPost();

        $this->deleteJson("/api/posts/{$post->id}/reaction")
            ->assertUnauthorized();
    }

    public function test_reaction_undo_removes_only_authenticated_users_current_state(): void
    {
        [$user, $post] = $this->userAndPost();
        $otherUser = User::query()->create([
            'name' => 'Other',
            'email' => 'other@example.test',
            'password' => 'password',
        ]);
        $user->postReactions()->create(['post_id' => $post->id, 'reaction_kind' => ReactionKind::Support->value]);
        $otherUser->postReactions()->create(['post_id' => $post->id, 'reaction_kind' => ReactionKind::GoodVibes->value]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/posts/{$post->id}/reaction")
            ->assertOk()
            ->assertJsonPath('data.post_id', $post->id)
            ->assertJsonPath('data.viewer_has_reacted', false)
            ->assertJsonPath('data.viewer_reaction_kind', null);

        $this->assertDatabaseMissing('post_reactions', [
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);
        $this->assertDatabaseHas('post_reactions', [
            'user_id' => $otherUser->id,
            'post_id' => $post->id,
        ]);
    }

    public function test_reaction_undo_is_idempotent(): void
    {
        [$user, $post] = $this->userAndPost();
        Sanctum::actingAs($user);

        $this->deleteJson("/api/posts/{$post->id}/reaction")
            ->assertOk()
            ->assertJsonPath('data.viewer_has_reacted', false);

        $this->assertDatabaseCount('post_reactions', 0);
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
