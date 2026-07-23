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
            ],
            'text' => $this->text,
            'image_url' => $this->image_url,
            'similarity_score' => round((float) $this->similarity_score, 6),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
