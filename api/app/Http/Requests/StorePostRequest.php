<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'text' => ['required', 'string', 'min:1', 'max:5000'],
            'image_url' => ['nullable', 'url', 'max:2048'],
        ];
    }
}
