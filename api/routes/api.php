<?php

use App\Http\Controllers\AuthTokenController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\InteractionController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostReactionController;
use App\Http\Controllers\SearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/tokens', [AuthTokenController::class, 'store']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/me', function (Request $request): array {
        $user = $request->user();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url,
        ];
    });
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/feed', [FeedController::class, 'index']);
    Route::get('/search', [SearchController::class, 'index']);
    Route::post('/interactions', [InteractionController::class, 'store']);
    Route::delete('/posts/{post}/reaction', [PostReactionController::class, 'destroy']);
});
