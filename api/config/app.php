<?php

return [
    'name' => env('APP_NAME', 'Guised Up API'),
    'env' => env('APP_ENV', 'local'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost:8000'),
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',
    'timezone' => 'UTC',
    'locale' => 'en',
    'fallback_locale' => 'en',
    'faker_locale' => 'en_US',
    'providers' => Illuminate\Support\ServiceProvider::defaultProviders()
        ->merge(require __DIR__.'/../bootstrap/providers.php')
        ->toArray(),
];
