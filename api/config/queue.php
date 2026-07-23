<?php

return [
    'default' => env('QUEUE_CONNECTION', 'deferred'),

    'connections' => [
        'deferred' => [
            'driver' => 'deferred',
        ],

        'background' => [
            'driver' => 'background',
        ],
    ],
];
