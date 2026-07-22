<?php

namespace App\Providers;

use App\Services\EmbeddingClient;
use App\Services\Feed\EloquentFeedCandidateRepository;
use App\Services\Feed\FeedCandidateRepository;
use App\Services\Feed\FeedRanker;
use App\Services\Feed\WeightedFeedRanker;
use App\Services\HttpEmbeddingClient;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(EmbeddingClient::class, HttpEmbeddingClient::class);
        $this->app->bind(FeedCandidateRepository::class, EloquentFeedCandidateRepository::class);
        $this->app->bind(FeedRanker::class, WeightedFeedRanker::class);
    }
}
