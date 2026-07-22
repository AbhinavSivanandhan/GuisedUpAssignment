<?php

namespace App\Services\Search;

use Carbon\CarbonInterface;

class SearchIntent
{
    public function __construct(
        public readonly string $embeddingQuery,
        public readonly ?CarbonInterface $startsAt = null,
        public readonly ?CarbonInterface $endsAt = null,
        public readonly ?string $temporalLabel = null,
        public readonly ?string $temporalInterpretation = null
    ) {
    }

    public function temporalFilter(): ?array
    {
        if ($this->startsAt === null || $this->endsAt === null || $this->temporalLabel === null) {
            return null;
        }

        return [
            'label' => $this->temporalLabel,
            'interpretation' => $this->temporalInterpretation,
            'start' => $this->startsAt->toISOString(),
            'end' => $this->endsAt->toISOString(),
        ];
    }
}
