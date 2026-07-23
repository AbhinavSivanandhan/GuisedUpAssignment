<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $query = $this->query('q');

        if (is_string($query)) {
            $this->merge([
                'q' => trim($query),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'q' => ['required', 'string', 'min:1', 'max:500'],
        ];
    }
}
