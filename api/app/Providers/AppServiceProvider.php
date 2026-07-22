<?php

namespace App\Providers;

use App\Services\EmbeddingClient;
use App\Services\HttpEmbeddingClient;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(EmbeddingClient::class, HttpEmbeddingClient::class);
    }
}
