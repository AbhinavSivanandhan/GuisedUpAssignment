<?php

namespace App\Services;

class PgVector
{
    /**
     * @param list<float> $values
     */
    public static function literal(array $values): string
    {
        return '['.implode(',', array_map(
            static fn (float $value): string => rtrim(rtrim(sprintf('%.8F', $value), '0'), '.'),
            $values
        )).']';
    }
}
