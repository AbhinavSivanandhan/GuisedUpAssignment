<?php

namespace App\Http\Controllers;

use App\Enums\ReactionKind;
use App\Http\Requests\StoreInteractionRequest;
use App\Http\Resources\InteractionResource;
use App\Models\Interaction;
use Illuminate\Http\JsonResponse;

class InteractionController extends Controller
{
    public function store(StoreInteractionRequest $request): JsonResponse
    {
        $interaction = $request->user()->interactions()->create($request->validated());

        if ($interaction->type === Interaction::TYPE_REACTION) {
            $request->user()->postReactions()->updateOrCreate([
                'post_id' => $interaction->post_id,
            ], [
                'reaction_kind' => $interaction->reaction_kind ?? ReactionKind::default(),
            ]);
        }

        return (new InteractionResource($interaction))
            ->response()
            ->setStatusCode(201);
    }
}
