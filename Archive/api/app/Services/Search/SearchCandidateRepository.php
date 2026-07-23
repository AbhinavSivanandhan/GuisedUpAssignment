<?php

namespace App\Services\Search;

use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

interface SearchCandidateRepository
{
    /**
     * @param list<float> $queryEmbedding
     */
    public function topSimilar(
        array $queryEmbedding,
        int $limit,
        ?CarbonInterface $startsAt = null,
        ?CarbonInterface $endsAt = null
    ): Collection;
}
