<?php

namespace App\Services\Feed;

use App\Models\User;
use Illuminate\Support\Collection;

interface FeedCandidateRepository
{
    /**
     * @return Collection<int, \App\Models\Post>
     */
    public function forFeed(User $user): Collection;
}
