<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $rankingDebug = $this->resource->getAttribute('ranking_debug');

        $payload = [
            'id' => $this->id,
            'author' => [
                'id' => $this->user_id,
                'name' => $this->whenLoaded('user', fn () => $this->user->name),
                'avatar_url' => $this->whenLoaded('user', fn () => $this->user->avatar_url),
            ],
            'text' => $this->text,
            'image_url' => $this->image_url,
            'viewer_has_reacted' => (bool) ($this->viewer_has_reacted ?? false),
            'viewer_reaction_kind' => $this->when(
                $this->relationLoaded('reactions'),
                fn () => $this->reactions->first()?->reaction_kind
            ),
            'authenticity' => [
                'text_score' => $this->text_authenticity_score,
                'image_score' => $this->image_authenticity_score,
                'combined_score' => $this->authenticity_score,
            ],
            'embedding_status' => $this->embedding_status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];

        if (config('feed.debug_enabled', false) && ! app()->environment('production') && $rankingDebug !== null) {
            $payload['ranking_debug'] = $rankingDebug;
        }

        return $payload;
    }
}
