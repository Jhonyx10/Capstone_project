<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class IncidentLocationRequest extends FormRequest
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
            'zone_id' => 'required|exists:zones,id',
            'location_name' => 'required|string',
            'latitude' => 'required',
            'longitude' => 'required',
            'landmark' => 'required|image|mimes:jpg,png'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Validation failed.',
            'errors' => $validator->errors(),
        ], 422));
    }

    public function messages(): array
    {
        return [
            'zone_id.required' => 'please the designated zone of the area.',
            'zone_id.exists' => 'zone is not found.',
            'location_name.required' => 'location name is required.',
            'landmark.required' => 'please submit location landmark.',
            'landmark.image' => 'please submit image only',
            'landmark.mimes' => 'only accepts jpg and png file for image.'
        ];
    }
}
