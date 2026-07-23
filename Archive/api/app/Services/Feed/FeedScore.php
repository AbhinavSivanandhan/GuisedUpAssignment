<?php

namespace App\Services\Feed;

final readonly class FeedScore
{
    public function __construct(
        public float $authenticity,
        public float $relationshipDepth,
        public float $semanticSimilarity,
        public float $timeDecay,
        public float $finalScore,
    ) {
    }
}
