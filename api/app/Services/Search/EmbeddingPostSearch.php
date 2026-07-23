<?php

namespace App\Services\Search;

use App\Models\User;
use App\Services\EmbeddingClient;

class EmbeddingPostSearch implements PostSearch
{
    public function __construct(
        private readonly EmbeddingClient $embeddingClient,
        private readonly SearchCandidateRepository $candidates,
        private readonly TemporalIntentParser $temporalIntentParser
    ) {
    }

    public function search(User $user, string $query): SearchResults
    {
        $intent = $this->temporalIntentParser->parse($query);
        $analysis = $this->embeddingClient->analyze($intent->embeddingQuery);

        return new SearchResults(
            posts: $this->candidates->topSimilar(
                $user,
                $analysis->embedding,
                (int) config('search.limit', 10),
                $intent->startsAt,
                $intent->endsAt
            ),
            intent: $intent,
            embeddingMode: $analysis->mode
        );
    }
}
