<?php

namespace App\Services\Search;

use App\Models\User;
use Illuminate\Support\Collection;

interface PostSearch
{
    public function search(User $user, string $query): SearchResults;
}
