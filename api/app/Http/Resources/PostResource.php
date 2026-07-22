<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
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
            'authenticity' => [
                'text_score' => $this->text_authenticity_score,
                'image_score' => $this->image_authenticity_score,
                'combined_score' => $this->authenticity_score,
            ],
            'embedding_status' => $this->embedding_status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
