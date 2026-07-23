<?php

namespace App\Http\Controllers;

use App\Http\Requests\FeedRequest;
use App\Http\Resources\PostResource;
use App\Services\Feed\FeedCandidateRepository;
use App\Services\Feed\FeedRanker;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

class FeedController extends Controller
{
    public function index(
        FeedRequest $request,
        FeedCandidateRepository $candidates,
        FeedRanker $ranker
    ): JsonResponse {
        $validated = $request->validated();
        $page = (int) ($validated['page'] ?? 1);
        $perPage = (int) config('feed.per_page', 20);

        $rankedPosts = $ranker->rank(
            $request->user(),
            $candidates->forFeed($request->user())
        );

        $paginator = new LengthAwarePaginator(
            $rankedPosts->forPage($page, $perPage)->values(),
            $rankedPosts->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        return PostResource::collection($paginator)
            ->response();
    }
}
