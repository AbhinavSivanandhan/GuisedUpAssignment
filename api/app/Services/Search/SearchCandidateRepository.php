<?php

namespace App\Services\Search;

use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

interface SearchCandidateRepository
{
    /**
     * @param list<float> $queryEmbedding
     */
    public function topSimilar(
        User $viewer,
        array $queryEmbedding,
        int $limit,
        ?CarbonInterface $startsAt = null,
        ?CarbonInterface $endsAt = null
    ): Collection;
}
