<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Arr;

class HttpEmbeddingClient implements EmbeddingClient
{
    public function analyze(string $text, ?string $imageUrl = null): EmbeddingAnalysis
    {
        $baseUrl = rtrim((string) config('services.embedding.base_url'), '/');
        $response = Http::connectTimeout((float) config('services.embedding.connect_timeout'))
            ->timeout((float) config('services.embedding.timeout'))
            ->acceptJson()
            ->post($baseUrl.'/analyze', [
                'text' => $text,
                'image_url' => $imageUrl,
                'mode' => config('services.embedding.mode'),
            ]);

        if (! $response->successful()) {
            throw new EmbeddingServiceException('Embedding service request failed.');
        }

        $payload = $response->json();
        if (! is_array($payload)) {
            throw new EmbeddingServiceException('Embedding service returned invalid JSON.');
        }

        $embedding = Arr::get($payload, 'embedding');
        if (! is_array($embedding) || count($embedding) !== 384) {
            throw new EmbeddingServiceException('Embedding service returned a malformed embedding.');
        }

        $embedding = array_values(array_map(function (mixed $value): float {
            if (! is_int($value) && ! is_float($value)) {
                throw new EmbeddingServiceException('Embedding values must be numeric.');
            }
            $float = (float) $value;
            if (! is_finite($float)) {
                throw new EmbeddingServiceException('Embedding values must be finite.');
            }
            return $float;
        }, $embedding));

        $mode = Arr::get($payload, 'mode');
        if (! in_array($mode, ['transformer', 'fallback'], true)) {
            throw new EmbeddingServiceException('Embedding mode is invalid.');
        }

        return new EmbeddingAnalysis(
            embedding: $embedding,
            mode: $mode,
            model: (string) Arr::get($payload, 'model', ''),
            textAuthenticityScore: $this->score($payload, 'authenticity.text_score'),
            imageAuthenticityScore: $this->nullableScore($payload, 'authenticity.image_score'),
            authenticityScore: $this->score($payload, 'authenticity.combined_score'),
            signals: Arr::get($payload, 'authenticity.signals', []),
        );
    }

    private function score(array $payload, string $key): float
    {
        $value = Arr::get($payload, $key);
        if (! is_int($value) && ! is_float($value)) {
            throw new EmbeddingServiceException("Missing score: {$key}.");
        }
        $score = (float) $value;
        if ($score < 0 || $score > 1) {
            throw new EmbeddingServiceException("Score out of range: {$key}.");
        }
        return $score;
    }

    private function nullableScore(array $payload, string $key): ?float
    {
        $value = Arr::get($payload, $key);
        if ($value === null) {
            return null;
        }
        if (! is_int($value) && ! is_float($value)) {
            throw new EmbeddingServiceException("Invalid nullable score: {$key}.");
        }
        $score = (float) $value;
        if ($score < 0 || $score > 1) {
            throw new EmbeddingServiceException("Score out of range: {$key}.");
        }
        return $score;
    }
}
