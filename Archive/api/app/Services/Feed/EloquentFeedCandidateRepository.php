<?php

namespace App\Services\Feed;

use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Collection;

class EloquentFeedCandidateRepository implements FeedCandidateRepository
{
    public function forFeed(User $user): Collection
    {
        return Post::query()
            ->with('user')
            ->whereNotNull('embedding')
            ->whereIn('embedding_status', ['ready', 'fallback'])
            ->get();
    }
}
