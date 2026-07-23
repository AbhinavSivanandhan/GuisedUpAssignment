<?php

namespace App\Http\Requests;

use App\Enums\ReactionKind;
use App\Models\Interaction;
use App\Models\SearchEvent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
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

        if (! $this->filled('source')) {
            $this->merge(['source' => Interaction::SOURCE_FEED]);
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
            'source' => ['sometimes', 'string', Rule::in(Interaction::SOURCES)],
            'search_event_id' => [
                'nullable',
                'integer',
                Rule::requiredIf(fn (): bool => $this->input('source') === Interaction::SOURCE_SEARCH),
                Rule::prohibitedIf(fn (): bool => $this->input('source') !== Interaction::SOURCE_SEARCH),
                'exists:search_events,id',
            ],
            'visible_duration_ms' => [
                'nullable',
                'integer',
                'min:0',
                Rule::prohibitedIf(fn (): bool => $this->input('type') !== Interaction::TYPE_VIEW),
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty() || $this->input('source') !== Interaction::SOURCE_SEARCH) {
                return;
            }

            $searchEvent = SearchEvent::query()
                ->where('id', $this->input('search_event_id'))
                ->where('user_id', $this->user()?->id)
                ->first();

            if ($searchEvent === null) {
                $validator->errors()->add('search_event_id', 'The selected search event is invalid.');

                return;
            }

            if (! in_array((int) $this->input('post_id'), array_map('intval', $searchEvent->result_post_ids ?? []), true)) {
                $validator->errors()->add('post_id', 'The selected post was not returned by that search event.');
            }
        });
    }
}
