<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    protected $fillable = [
        'text',
        'image_url',
        'embedding',
        'text_authenticity_score',
        'image_authenticity_score',
        'authenticity_score',
        'embedding_status',
    ];

    protected function casts(): array
    {
        return [
            'text_authenticity_score' => 'float',
            'image_authenticity_score' => 'float',
            'authenticity_score' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(PostReaction::class);
    }
}
