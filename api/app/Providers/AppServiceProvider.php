<?php

namespace App\Providers;

use App\Services\EmbeddingClient;
use App\Services\Feed\EloquentFeedCandidateRepository;
use App\Services\Feed\FeedCandidateRepository;
use App\Services\Feed\FeedRanker;
use App\Services\Feed\WeightedFeedRanker;
use App\Services\HttpEmbeddingClient;
use App\Services\Search\CosineSearchSimilarityCalculator;
use App\Services\Search\EloquentSearchCandidateRepository;
use App\Services\Search\EmbeddingPostSearch;
use App\Services\Search\PostSearch;
use App\Services\Search\SearchCandidateRepository;
use App\Services\Search\SearchSimilarityCalculator;
use App\Services\Search\SimpleTemporalIntentParser;
use App\Services\Search\TemporalIntentParser;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(EmbeddingClient::class, HttpEmbeddingClient::class);
        $this->app->bind(FeedCandidateRepository::class, EloquentFeedCandidateRepository::class);
        $this->app->bind(FeedRanker::class, WeightedFeedRanker::class);
        $this->app->bind(SearchSimilarityCalculator::class, CosineSearchSimilarityCalculator::class);
        $this->app->bind(SearchCandidateRepository::class, EloquentSearchCandidateRepository::class);
        $this->app->bind(TemporalIntentParser::class, SimpleTemporalIntentParser::class);
        $this->app->bind(PostSearch::class, EmbeddingPostSearch::class);
    }
}
