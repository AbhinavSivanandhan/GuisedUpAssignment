<?php

namespace App\Http\Requests;

use App\Enums\ReactionKind;
use App\Models\Interaction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInteractionRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->input('type') === Interaction::TYPE_REACTION && ! $this->filled('reaction_kind')) {
            $this->merge(['reaction_kind' => ReactionKind::default()]);
        }

        if ($this->input('type') !== Interaction::TYPE_REACTION && $this->has('reaction_kind')) {
            $this->merge(['reaction_kind' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'post_id' => ['required', 'integer', 'exists:posts,id'],
            'type' => ['required', 'string', Rule::in(Interaction::TYPES)],
            'reaction_kind' => [
                'nullable',
                'string',
                Rule::requiredIf(fn (): bool => $this->input('type') === Interaction::TYPE_REACTION),
                Rule::prohibitedIf(fn (): bool => $this->input('type') !== Interaction::TYPE_REACTION),
                Rule::in(ReactionKind::values()),
            ],
        ];
    }
}
