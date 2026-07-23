<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInteractionRequest;
use App\Http\Resources\InteractionResource;
use Illuminate\Http\JsonResponse;

class InteractionController extends Controller
{
    public function store(StoreInteractionRequest $request): JsonResponse
    {
        $interaction = $request->user()->interactions()->create($request->validated());

        return (new InteractionResource($interaction))
            ->response()
            ->setStatusCode(201);
    }
}
