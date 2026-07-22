<?php

namespace App\Services\Search;

use App\Models\Post;

interface SearchSimilarityCalculator
{
    /**
     * @param list<float> $queryEmbedding
     */
    public function score(array $queryEmbedding, Post $post): float;
}
