<?php

namespace App\Services\Search;

interface TemporalIntentParser
{
    public function parse(string $query): SearchIntent;
}
