<?php

namespace App\Http\Requests;

use App\Models\WatchList;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWatchListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $current = $this->route('watch_list');

        return [
            'type'       => ['sometimes', Rule::in(WatchList::TYPES)],
            'identifier' => [
                'sometimes', 'string', 'max:255',
                Rule::unique('watch_lists', 'identifier')
                    ->where('type', $this->input('type', $current->type))
                    ->whereNull('deleted_at')
                    ->ignore($current),
            ],
            'details'    => ['sometimes', 'string'],
            'reason'     => ['sometimes', 'string'],
            'image'      => ['sometimes', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'status'     => ['sometimes', Rule::in(WatchList::STATUSES)],
        ];
    }
}