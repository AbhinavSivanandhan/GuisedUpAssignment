<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Services\EmbeddingClient;
use App\Services\EmbeddingServiceException;
use App\Services\PgVector;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    public function store(StorePostRequest $request, EmbeddingClient $embeddingClient): JsonResponse
    {
        $validated = $request->validated();

        try {
            $analysis = $embeddingClient->analyze($validated['text'], $validated['image_url'] ?? null);
        } catch (EmbeddingServiceException) {
            return response()->json([
                'message' => 'Embedding analysis is unavailable.',
            ], 503);
        }

        $post = DB::transaction(function () use ($request, $validated, $analysis): Post {
            /** @var Post $post */
            $post = $request->user()->posts()->create([
                'text' => $validated['text'],
                'image_url' => $validated['image_url'] ?? null,
                'embedding' => PgVector::literal($analysis->embedding),
                'text_authenticity_score' => $analysis->textAuthenticityScore,
                'image_authenticity_score' => $analysis->imageAuthenticityScore,
                'authenticity_score' => $analysis->authenticityScore,
                'embedding_status' => $analysis->mode === 'fallback' ? 'fallback' : 'ready',
            ]);

            return $post;
        });

        return (new PostResource($post->load('user')))
            ->response()
            ->setStatusCode(201);
    }
}
