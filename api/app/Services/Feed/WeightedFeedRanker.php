<?php

namespace App\Services\Feed;

use App\Models\Interaction;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Collection;

class WeightedFeedRanker implements FeedRanker
{
    public function rank(User $user, Collection $candidates): Collection
    {
        $interactions = $user->interactions()
            ->with('post')
            ->get();

        $relationshipScores = $this->relationshipScores($interactions);
        $interestVector = $this->interestVector($interactions);
        $scores = [];

        foreach ($candidates as $post) {
            $scores[$post->id] = $this->score($post, $relationshipScores, $interestVector);
        }

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
            ->values();
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

    /**
     * @param Collection<int, Interaction> $interactions
     * @return array<int, float>
     */
    private function relationshipScores(Collection $interactions): array
    {
        $rawScores = [];

        foreach ($interactions as $interaction) {
            if (! $interaction->post) {
                continue;
            }

            $authorId = $interaction->post->user_id;
            $rawScores[$authorId] = ($rawScores[$authorId] ?? 0.0)
                + $this->interactionWeight($interaction);
        }

        $max = max($rawScores ?: [0.0]);
        if ($max <= 0.0) {
            return [];
        }

        return array_map(
            fn (float $value): float => $this->clamp($value / $max),
            $rawScores
        );
    }

    /**
     * @param Collection<int, Interaction> $interactions
     * @return list<float>|null
     */
    private function interestVector(Collection $interactions): ?array
    {
        $vectors = [];
        $weights = [];

        foreach ($interactions as $interaction) {
            if (! $interaction->post) {
                continue;
            }

            $vector = VectorMath::parse((string) $interaction->post->embedding);
            if ($vector === []) {
                continue;
            }

            $vectors[] = $vector;
            $weights[] = $this->interactionWeight($interaction);
        }

        return VectorMath::weightedAverage($vectors, $weights);
    }

    private function interactionWeight(Interaction $interaction): float
    {
        $typeWeights = config('feed.ranking.relationship_event_weights');
        $baseWeight = (float) ($typeWeights[$interaction->type] ?? 0.0);
        $createdAt = $interaction->created_at;
        if ($createdAt === null || $baseWeight <= 0.0) {
            return 0.0;
        }

        $ageSeconds = max(0, $createdAt->diffInSeconds(now(), true));
        $halfLifeSeconds = max(1, (int) config('feed.ranking.relationship_half_life_days', 30) * 86400);

        return $baseWeight * exp(-log(2) * $ageSeconds / $halfLifeSeconds);
    }

    private function clamp(float $value): float
    {
        return max(0.0, min(1.0, $value));
    }
}
