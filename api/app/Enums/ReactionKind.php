<?php

namespace App\Enums;

enum ReactionKind: string
{
    case Like = 'like';
    case Support = 'support';
    case GoodVibes = 'good_vibes';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(fn (self $kind): string => $kind->value, self::cases());
    }

    public static function default(): string
    {
        return self::Like->value;
    }
}
