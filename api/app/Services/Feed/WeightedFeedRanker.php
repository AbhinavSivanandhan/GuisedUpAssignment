<?php

namespace App\Services\Feed;

use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Collection;

class WeightedFeedRanker implements FeedRanker
{
    public function __construct(private readonly UserFeedProfileService $profiles)
    {
    }

    public function rank(User $user, Collection $candidates): Collection
    {
        $profile = $this->profiles->forRanking($user);
        $scores = [];

        foreach ($candidates as $post) {
            $scores[$post->id] = $this->score($post, $profile->relationshipScores, $profile->interestVector);
        }

        $debugEnabled = $this->debugEnabled();

        return $candidates
            ->sort(function (Post $left, Post $right) use ($scores): int {
                $scoreComparison = $scores[$right->id]->finalScore <=> $scores[$left->id]->finalScore;
                if ($scoreComparison !== 0) {
                    return $scoreComparison;
                }

                $createdComparison = $right->created_at?->getTimestamp() <=> $left->created_at?->getTimestamp();
                if ($createdComparison !== 0) {
                    return $createdComparison;
                }

                return $right->id <=> $left->id;
            })
            ->values()
            ->when($debugEnabled, function (Collection $ranked) use ($scores): Collection {
                return $ranked->values()->map(function (Post $post, int $index) use ($scores): Post {
                    $post->setAttribute('ranking_debug', $this->rankingDebug($index + 1, $scores[$post->id]));

                    return $post;
                });
            });
    }

    /**
     * @param array<int, float> $relationshipScores
     * @param list<float>|null $interestVector
     */
    public function score(Post $post, array $relationshipScores, ?array $interestVector): FeedScore
    {
        $authenticity = $this->clamp((float) $post->authenticity_score);
        $relationshipDepth = $relationshipScores[$post->user_id] ?? 0.0;
        $semanticSimilarity = $this->semanticSimilarity($post, $interestVector);
        $timeDecay = $this->timeDecay($post);
        $weights = config('feed.ranking.weights');

        $finalScore =
            $weights['authenticity'] * $authenticity
            + $weights['relationship_depth'] * $relationshipDepth
            + $weights['semantic_similarity'] * $semanticSimilarity
            + $weights['time_decay'] * $timeDecay;

        return new FeedScore(
            authenticity: $authenticity,
            relationshipDepth: $relationshipDepth,
            semanticSimilarity: $semanticSimilarity,
            timeDecay: $timeDecay,
            finalScore: $this->clamp($finalScore),
        );
    }

    private function semanticSimilarity(Post $post, ?array $interestVector): float
    {
        if ($interestVector === null) {
            return (float) config('feed.ranking.cold_start_semantic_similarity', 0.5);
        }

        $postVector = VectorMath::parse((string) $post->embedding);
        if ($postVector === []) {
            return 0.0;
        }

        return $this->clamp((VectorMath::cosine($interestVector, $postVector) + 1.0) / 2.0);
    }

    private function timeDecay(Post $post): float
    {
        $createdAt = $post->created_at;
        if ($createdAt === null) {
            return 0.0;
        }

        $ageSeconds = max(0, $createdAt->diffInSeconds(now(), true));
        $halfLifeSeconds = max(1, (int) config('feed.ranking.time_decay_half_life_days', 7) * 86400);

        return $this->clamp(exp(-log(2) * $ageSeconds / $halfLifeSeconds));
    }

    private function clamp(float $value): float
    {
        return max(0.0, min(1.0, $value));
    }

    private function rankingDebug(int $rank, FeedScore $score): array
    {
        $weights = config('feed.ranking.weights');
        $components = [
            'authenticity' => $this->debugComponent($score->authenticity, (float) $weights['authenticity']),
            'relationship_depth' => $this->debugComponent($score->relationshipDepth, (float) $weights['relationship_depth']),
            'semantic_similarity' => $this->debugComponent($score->semanticSimilarity, (float) $weights['semantic_similarity']),
            'time_decay' => $this->debugComponent($score->timeDecay, (float) $weights['time_decay']),
        ];
        $finalScore = array_sum(array_column($components, 'contribution'));

        return [
            'rank' => $rank,
            'final_score' => round($finalScore, 4),
            'components' => $components,
        ];
    }

    private function debugComponent(float $score, float $weight): array
    {
        return [
            'score' => round($score, 4),
            'weight' => $weight,
            'contribution' => round($score * $weight, 4),
        ];
    }

    private function debugEnabled(): bool
    {
        return (bool) config('feed.debug_enabled', false)
            && ! app()->environment('production');
    }
}
