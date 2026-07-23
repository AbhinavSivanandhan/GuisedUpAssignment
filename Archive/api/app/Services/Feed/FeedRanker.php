<?php

namespace App\Services\Feed;

use App\Models\User;
use Illuminate\Support\Collection;

interface FeedRanker
{
    /**
     * @param Collection<int, \App\Models\Post> $candidates
     * @return Collection<int, \App\Models\Post>
     */
    public function rank(User $user, Collection $candidates): Collection;
}
