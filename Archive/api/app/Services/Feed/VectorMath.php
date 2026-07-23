<?php

namespace App\Services\Feed;

class VectorMath
{
    /**
     * @return list<float>
     */
    public static function parse(string $literal): array
    {
        $trimmed = trim($literal, "[] \t\n\r\0\x0B");
        if ($trimmed === '') {
            return [];
        }

        return array_map('floatval', explode(',', $trimmed));
    }

    /**
     * @param list<float> $left
     * @param list<float> $right
     */
    public static function cosine(array $left, array $right): float
    {
        $count = min(count($left), count($right));
        if ($count === 0) {
            return 0.0;
        }

        $dot = 0.0;
        $leftNorm = 0.0;
        $rightNorm = 0.0;

        for ($index = 0; $index < $count; $index++) {
            $dot += $left[$index] * $right[$index];
            $leftNorm += $left[$index] * $left[$index];
            $rightNorm += $right[$index] * $right[$index];
        }

        if ($leftNorm <= 0.0 || $rightNorm <= 0.0) {
            return 0.0;
        }

        return $dot / (sqrt($leftNorm) * sqrt($rightNorm));
    }

    /**
     * @param array<int, list<float>> $vectors
     * @param array<int, float> $weights
     * @return list<float>|null
     */
    public static function weightedAverage(array $vectors, array $weights): ?array
    {
        if ($vectors === []) {
            return null;
        }

        $dimensions = count($vectors[0]);
        $output = array_fill(0, $dimensions, 0.0);
        $totalWeight = 0.0;

        foreach ($vectors as $index => $vector) {
            $weight = $weights[$index] ?? 0.0;
            if ($weight <= 0.0 || count($vector) !== $dimensions) {
                continue;
            }

            $totalWeight += $weight;
            for ($dimension = 0; $dimension < $dimensions; $dimension++) {
                $output[$dimension] += $vector[$dimension] * $weight;
            }
        }

        if ($totalWeight <= 0.0) {
            return null;
        }

        return array_map(
            static fn (float $value): float => $value / $totalWeight,
            $output
        );
    }
}
