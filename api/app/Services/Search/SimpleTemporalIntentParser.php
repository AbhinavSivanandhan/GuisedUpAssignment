<?php

namespace App\Services\Search;

class SimpleTemporalIntentParser implements TemporalIntentParser
{
    public function parse(string $query): SearchIntent
    {
        if (! preg_match('/\blast\s+week\b/i', $query)) {
            return new SearchIntent($query);
        }

        $embeddingQuery = trim((string) preg_replace('/\blast\s+week\b/i', '', $query));
        if ($embeddingQuery === '') {
            $embeddingQuery = $query;
        }

        return new SearchIntent(
            embeddingQuery: $embeddingQuery,
            startsAt: now()->subWeek(),
            endsAt: now(),
            temporalLabel: 'last_week',
            temporalInterpretation: 'trailing_7_days'
        );
    }
}
