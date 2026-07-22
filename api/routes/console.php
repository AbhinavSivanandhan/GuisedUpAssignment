<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about:guised-up', function (): void {
    $this->info('Guised Up API foundation');
});
