<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InteractionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'post_id' => $this->post_id,
            'type' => $this->type,
            'reaction_kind' => $this->reaction_kind,
            'source' => $this->source,
            'search_event_id' => $this->search_event_id,
            'visible_duration_ms' => $this->visible_duration_ms,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
