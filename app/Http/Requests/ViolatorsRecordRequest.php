<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ViolatorsRecordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'violator_id' => 'nullable|array',
           'violator_id.*' => 'nullable|exists:violators_profiles,id'
        ];
    }
}
