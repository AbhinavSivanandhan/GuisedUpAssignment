<?php

namespace App\Services\Feed;

final readonly class UserFeedProfileData
{
    /**
     * @param list<float>|null $interestVector
     * @param array<int, float> $relationshipScores
     * @param array<int, float> $rawRelationshipTotals
     */
    public function __construct(
        public ?array $interestVector,
        public array $relationshipScores,
        public array $rawRelationshipTotals = [],
        public int $evidenceCount = 0,
        public ?int $sourceInteractionId = null,
    ) {
    }

    public static function coldStart(): self
    {
        return new self(
            interestVector: null,
            relationshipScores: [],
        );
    }
}
