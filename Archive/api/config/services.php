<?php

return [
    'embedding' => [
        'base_url' => env('EMBEDDING_SERVICE_URL', 'http://embedding-service:8001'),
        'timeout' => (float) env('EMBEDDING_REQUEST_TIMEOUT', 5),
        'connect_timeout' => (float) env('EMBEDDING_CONNECT_TIMEOUT', 2),
        'mode' => env('EMBEDDING_MODE', 'fallback'),
        'model' => env('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2'),
    ],
];
