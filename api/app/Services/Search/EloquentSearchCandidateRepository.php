<?php

namespace App\Services\Search;

use App\Models\Post;
use App\Models\User;
use App\Services\PgVector;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EloquentSearchCandidateRepository implements SearchCandidateRepository
{
    public function __construct(private readonly SearchSimilarityCalculator $similarity)
    {
    }

    public function topSimilar(
        User $viewer,
        array $queryEmbedding,
        int $limit,
        ?CarbonInterface $startsAt = null,
        ?CarbonInterface $endsAt = null
    ): Collection {
        if (DB::getDriverName() === 'pgsql') {
            return $this->topSimilarWithPgvector($viewer, $queryEmbedding, $limit, $startsAt, $endsAt);
        }

        return $this->topSimilarInMemory($viewer, $queryEmbedding, $limit, $startsAt, $endsAt);
    }

    private function topSimilarWithPgvector(
        User $viewer,
        array $queryEmbedding,
        int $limit,
        ?CarbonInterface $startsAt,
        ?CarbonInterface $endsAt
    ): Collection {
        $vector = PgVector::literal($queryEmbedding);

        return $this->baseQuery($startsAt, $endsAt)
            ->with('user')
            ->with([
                'reactions' => fn ($query) => $query
                    ->where('user_id', $viewer->id)
                    ->select('id', 'user_id', 'post_id', 'reaction_kind'),
            ])
            ->withExists([
                'reactions as viewer_has_reacted' => fn ($query) => $query->where('user_id', $viewer->id),
            ])
            ->select('posts.*')
            ->selectRaw('1 - (embedding <=> ?::vector) as similarity_score', [$vector])
            ->orderByRaw('embedding <=> ?::vector asc', [$vector])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get();
    }

    private function topSimilarInMemory(
        User $viewer,
        array $queryEmbedding,
        int $limit,
        ?CarbonInterface $startsAt,
        ?CarbonInterface $endsAt
    ): Collection {
        return $this->baseQuery($startsAt, $endsAt)
            ->with('user')
            ->with([
                'reactions' => fn ($query) => $query
                    ->where('user_id', $viewer->id)
                    ->select('id', 'user_id', 'post_id', 'reaction_kind'),
            ])
            ->withExists([
                'reactions as viewer_has_reacted' => fn ($query) => $query->where('user_id', $viewer->id),
            ])
            ->get()
            ->map(function (Post $post) use ($queryEmbedding): Post {
                $post->setAttribute('similarity_score', $this->similarity->score($queryEmbedding, $post));

                return $post;
            })
            ->sort(function (Post $left, Post $right): int {
                return [
                    (float) $right->similarity_score,
                    $right->created_at?->getTimestamp() ?? 0,
                    $right->id,
                ] <=> [
                    (float) $left->similarity_score,
                    $left->created_at?->getTimestamp() ?? 0,
                    $left->id,
                ];
            })
            ->take($limit)
            ->values();
    }

    private function baseQuery(?CarbonInterface $startsAt, ?CarbonInterface $endsAt)
    {
        return Post::query()
            ->whereNotNull('embedding')
            ->whereIn('embedding_status', ['ready', 'fallback'])
            ->when($startsAt !== null, fn ($query) => $query->where('created_at', '>=', $startsAt))
            ->when($endsAt !== null, fn ($query) => $query->where('created_at', '<=', $endsAt));
    }
}
