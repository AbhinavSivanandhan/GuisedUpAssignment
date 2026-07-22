<?php

namespace App\Services;

interface EmbeddingClient
{
    /**
     * @throws EmbeddingServiceException
     */
    public function analyze(string $text, ?string $imageUrl = null): EmbeddingAnalysis;
}
