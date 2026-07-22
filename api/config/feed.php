<?php

return [
    'per_page' => 20,

    'ranking' => [
        'weights' => [
            'authenticity' => 0.30,
            'relationship_depth' => 0.30,
            'semantic_similarity' => 0.25,
            'time_decay' => 0.15,
        ],
        'relationship_event_weights' => [
            'view' => 0.20,
            'reaction' => 0.60,
            'reply' => 1.00,
        ],
        'relationship_half_life_days' => 30,
        'time_decay_half_life_days' => 7,
        'cold_start_semantic_similarity' => 0.50,
    ],
];
