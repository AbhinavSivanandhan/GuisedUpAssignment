<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserFeedProfile extends Model
{
    protected $fillable = [
        'interest_embedding',
        'relationship_scores',
        'evidence_count',
        'source_interaction_id',
        'computed_at',
    ];

    protected function casts(): array
    {
        return [
            'relationship_scores' => 'array',
            'computed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sourceInteraction(): BelongsTo
    {
        return $this->belongsTo(Interaction::class, 'source_interaction_id');
    }
}
