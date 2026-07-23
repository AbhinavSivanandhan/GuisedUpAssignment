<?php

namespace App\Services\Search;

use Illuminate\Support\Collection;

class SearchResults
{
    public function __construct(
        public readonly Collection $posts,
        public readonly SearchIntent $intent,
        public readonly string $embeddingMode,
        public readonly array $queryEmbedding
    ) {
    }
}
