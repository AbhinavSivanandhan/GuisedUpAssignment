<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interaction extends Model
{
    public const TYPE_VIEW = 'view';
    public const TYPE_REPLY = 'reply';
    public const TYPE_REACTION = 'reaction';

    public const TYPES = [
        self::TYPE_VIEW,
        self::TYPE_REPLY,
        self::TYPE_REACTION,
    ];

    protected $fillable = [
        'post_id',
        'type',
        'reaction_kind',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
