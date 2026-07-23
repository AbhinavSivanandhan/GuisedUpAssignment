<?php

namespace App\Services\Feed;

use App\Models\Interaction;
use Illuminate\Support\Collection;

class UserFeedProfileCalculator
{
    /**
     * @param Collection<int, Interaction> $interactions
     */
    public function calculate(Collection $interactions): UserFeedProfileData
    {
        $rawRelationshipTotals = [];
        $vectors = [];
        $weights = [];
        $evidenceCount = 0;
        $sourceInteractionId = null;

        foreach ($interactions as $interaction) {
            $sourceInteractionId = max($sourceInteractionId ?? 0, $interaction->id);

            if (! $interaction->post) {
                continue;
            }

            $weight = $this->interactionWeight($interaction);
            if ($weight <= 0.0) {
                continue;
            }

            $evidenceCount++;
            $authorId = $interaction->post->user_id;
            $rawRelationshipTotals[$authorId] = ($rawRelationshipTotals[$authorId] ?? 0.0) + $weight;

            $vector = VectorMath::parse((string) $interaction->post->embedding);
            if ($vector !== []) {
                $vectors[] = $vector;
                $weights[] = $weight;
            }
        }

        return new UserFeedProfileData(
            interestVector: VectorMath::weightedAverage($vectors, $weights),
            relationshipScores: $this->normalizeRelationshipScores($rawRelationshipTotals),
            rawRelationshipTotals: $rawRelationshipTotals,
            evidenceCount: $evidenceCount,
            sourceInteractionId: $sourceInteractionId,
        );
    }

    public function interactionWeight(Interaction $interaction): float
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

    /**
     * @param array<int, float> $rawScores
     * @return array<int, float>
     */
    public function normalizeRelationshipScores(array $rawScores): array
    {
        $max = max($rawScores ?: [0.0]);
        if ($max <= 0.0) {
            return [];
        }

        return array_map(
            fn (float $value): float => $this->clamp($value / $max),
            $rawScores
        );
    }

    private function clamp(float $value): float
    {
        return max(0.0, min(1.0, $value));
    }
}
