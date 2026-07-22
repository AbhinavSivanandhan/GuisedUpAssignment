<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_post_creation_is_rejected(): void
    {
        $this->postJson('/api/posts', ['text' => 'hello'])
            ->assertUnauthorized();
    }

    public function test_authenticated_post_creation_validates_input(): void
    {
        Sanctum::actingAs(User::query()->create([
            'name' => 'Alex',
            'email' => 'alex@example.test',
            'password' => 'password',
        ]));

        $this->postJson('/api/posts', ['text' => '', 'image_url' => 'not-a-url'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['text', 'image_url']);
    }

    public function test_successful_post_creation_persists_owner_and_analysis_data(): void
    {
        Http::fake([
            '*embedding-service.test/analyze' => Http::response($this->analysisPayload(), 200),
        ]);

        $user = User::query()->create([
            'name' => 'Alex',
            'email' => 'alex@example.test',
            'password' => 'password',
        ]);
        Sanctum::actingAs($user);

        $this->postJson('/api/posts', [
            'text' => 'A grounded post about today',
            'image_url' => 'https://example.test/photo.jpg',
        ])
            ->assertCreated()
            ->assertJsonPath('data.text', 'A grounded post about today')
            ->assertJsonPath('data.embedding_status', 'fallback')
            ->assertJsonPath('data.authenticity.text_score', 0.8)
            ->assertJsonPath('data.authenticity.image_score', null)
            ->assertJsonPath('data.authenticity.combined_score', 0.8);

        $post = Post::query()->firstOrFail();
        $this->assertSame($user->id, $post->user_id);
        $this->assertSame('fallback', $post->embedding_status);
        $this->assertSame(0.8, $post->text_authenticity_score);
        $this->assertNull($post->image_authenticity_score);
    }

    public function test_post_creation_rejects_malformed_embedding_service_output(): void
    {
        Http::fake([
            '*embedding-service.test/analyze' => Http::response([
                'embedding' => [0.1, 0.2],
                'mode' => 'fallback',
                'model' => 'deterministic-hash-v1',
                'authenticity' => [
                    'text_score' => 0.5,
                    'image_score' => null,
                    'combined_score' => 0.5,
                    'signals' => [],
                ],
            ], 200),
        ]);

        Sanctum::actingAs(User::query()->create([
            'name' => 'Alex',
            'email' => 'alex@example.test',
            'password' => 'password',
        ]));

        $this->postJson('/api/posts', ['text' => 'hello'])
            ->assertStatus(503);

        $this->assertDatabaseCount('posts', 0);
    }

    public function test_post_creation_handles_embedding_service_failure_without_partial_persistence(): void
    {
        Http::fake([
            '*embedding-service.test/analyze' => Http::response(['message' => 'down'], 503),
        ]);

        Sanctum::actingAs(User::query()->create([
            'name' => 'Alex',
            'email' => 'alex@example.test',
            'password' => 'password',
        ]));

        $this->postJson('/api/posts', ['text' => 'hello'])
            ->assertStatus(503);

        $this->assertDatabaseCount('posts', 0);
    }

    private function analysisPayload(): array
    {
        return [
            'embedding' => array_fill(0, 384, 0.01),
            'mode' => 'fallback',
            'model' => 'deterministic-hash-v1',
            'authenticity' => [
                'text_score' => 0.8,
                'image_score' => null,
                'combined_score' => 0.8,
                'signals' => ['length_score' => 0.8],
            ],
        ];
    }
}
