<?php

namespace App\Services\Search;

use App\Models\Post;
use App\Services\Feed\VectorMath;

class CosineSearchSimilarityCalculator implements SearchSimilarityCalculator
{
    public function score(array $queryEmbedding, Post $post): float
    {
        return VectorMath::cosine($queryEmbedding, VectorMath::parse((string) $post->embedding));
    }
}
