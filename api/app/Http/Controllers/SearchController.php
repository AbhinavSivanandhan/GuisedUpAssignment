<?php

namespace App\Http\Controllers;

use App\Http\Requests\SearchRequest;
use App\Http\Resources\SearchResultResource;
use App\Services\EmbeddingServiceException;
use App\Services\PgVector;
use App\Services\Search\PostSearch;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    public function index(SearchRequest $request, PostSearch $search): JsonResponse
    {
        $query = $request->validated('q');

        try {
            $results = $search->search($request->user(), $query);
        } catch (EmbeddingServiceException) {
            return response()->json([
                'message' => 'Semantic search is unavailable.',
            ], 503);
        }

        $searchEvent = null;
        if ($results->posts->isNotEmpty()) {
            $searchEvent = $request->user()->searchEvents()->create([
                'query_text' => $query,
                'semantic_query' => $results->intent->embeddingQuery,
                'query_embedding' => PgVector::literal($results->queryEmbedding),
                'embedding_mode' => $results->embeddingMode,
                'temporal_filter' => $results->intent->temporalFilter(),
                'result_post_ids' => $results->posts->pluck('id')->values()->all(),
            ]);
        }

        return SearchResultResource::collection($results->posts)
            ->additional([
                'meta' => [
                    'query' => $query,
                    'limit' => (int) config('search.limit', 10),
                    'embedding_mode' => $results->embeddingMode,
                    'temporal_filter' => $results->intent->temporalFilter(),
                    'search_event_id' => $searchEvent?->id,
                ],
            ])
            ->response();
    }
}
