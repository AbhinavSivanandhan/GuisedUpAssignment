<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostReactionController extends Controller
{
    public function destroy(Request $request, Post $post): JsonResponse
    {
        $request->user()
            ->postReactions()
            ->where('post_id', $post->id)
            ->delete();

        return response()->json([
            'data' => [
                'post_id' => $post->id,
                'viewer_has_reacted' => false,
                'viewer_reaction_kind' => null,
            ],
        ]);
    }
}
