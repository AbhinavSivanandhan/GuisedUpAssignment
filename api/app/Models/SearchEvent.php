<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SearchEvent extends Model
{
    protected $fillable = [
        'query_text',
        'semantic_query',
        'query_embedding',
        'embedding_mode',
        'temporal_filter',
        'result_post_ids',
    ];

    protected function casts(): array
    {
        return [
            'temporal_filter' => 'array',
            'result_post_ids' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
