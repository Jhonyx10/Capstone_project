<?php

namespace App\Http\Requests;

use App\Models\WatchList;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSightingReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // permission is checked in the controller via the policy
    }

    public function rules(): array
    {
        return [
            // Only active, non-deleted watch list entries can be reported
            'subject_id' => [
                'required', 'integer',
                Rule::exists('watch_lists', 'id')
                    ->where('status', WatchList::STATUS_ACTIVE)
                    ->whereNull('deleted_at'),
            ],
            'location'   => ['required', 'string', 'max:255'],
            'latitude'   => ['required', 'numeric', 'between:-90,90'],
            'longitude'  => ['required', 'numeric', 'between:-180,180'],
            'note'       => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'subject_id.exists' => 'This watch list entry does not exist or is no longer active.',
        ];
    }
}