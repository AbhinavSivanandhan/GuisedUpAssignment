<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'alex@example.test'],
            ['name' => 'Alex Rivera', 'password' => Hash::make('password')]
        );

        User::query()->firstOrCreate(
            ['email' => 'sam@example.test'],
            ['name' => 'Sam Chen', 'password' => Hash::make('password')]
        );
    }
}
