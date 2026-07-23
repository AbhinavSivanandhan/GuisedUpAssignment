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
            ->with([
                'reactions' => fn ($query) => $query
                    ->where('user_id', $user->id)
                    ->select('id', 'user_id', 'post_id', 'reaction_kind'),
            ])
            ->withExists([
                'reactions as viewer_has_reacted' => fn ($query) => $query->where('user_id', $user->id),
            ])
            ->whereNotNull('embedding')
            ->whereIn('embedding_status', ['ready', 'fallback'])
            ->get();
    }
}
