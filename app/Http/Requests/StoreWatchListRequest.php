<?php

namespace App\Http\Requests;

use App\Models\WatchList;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWatchListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'       => ['required', Rule::in(WatchList::TYPES)],
            'identifier' => [
                'required', 'string', 'max:255',
                // No duplicate active entry of the same type
                Rule::unique('watch_lists', 'identifier')
                    ->where('type', $this->input('type'))
                    ->whereNull('deleted_at'),
            ],
            'details'    => ['required', 'string'],
            'reason'     => ['required', 'string'],
            'image'      => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'status'     => ['sometimes', Rule::in(WatchList::STATUSES)],
        ];
    }
}