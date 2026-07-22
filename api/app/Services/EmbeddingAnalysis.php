<?php

namespace App\Services;

final readonly class EmbeddingAnalysis
{
    /**
     * @param list<float> $embedding
     * @param array<string, mixed> $signals
     */
    public function __construct(
        public array $embedding,
        public string $mode,
        public string $model,
        public float $textAuthenticityScore,
        public ?float $imageAuthenticityScore,
        public float $authenticityScore,
        public array $signals,
    ) {
    }
}
