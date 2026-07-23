<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SearchResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
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
            'similarity_score' => round((float) $this->similarity_score, 6),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
