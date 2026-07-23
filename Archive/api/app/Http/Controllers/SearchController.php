<?php

namespace App\Http\Controllers;

use App\Http\Requests\SearchRequest;
use App\Http\Resources\SearchResultResource;
use App\Services\EmbeddingServiceException;
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

        return SearchResultResource::collection($results->posts)
            ->additional([
                'meta' => [
                    'query' => $query,
                    'limit' => (int) config('search.limit', 10),
                    'embedding_mode' => $results->embeddingMode,
                    'temporal_filter' => $results->intent->temporalFilter(),
                ],
            ])
            ->response();
    }
}
