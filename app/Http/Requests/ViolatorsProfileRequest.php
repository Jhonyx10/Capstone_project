<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ViolatorsProfileRequest extends FormRequest
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
            'last_name' => 'required|string',
            'first_name' => 'required|string',
            'age' => 'required|integer',
            'zone_id' => 'required|exists:zones,id',
            'address' => 'required|string',
            'photo' => 'required|file|mimes:jpg,png|max:5120'
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
            'last_name.required' => 'last name is required.',
            'first_name.required' => 'first name is required.',
            'age.required' => 'age is required.',
            'zone_id.required' => 'select zone address.',
            'address.required' => 'address required.',
            'photo.required' => 'photo is required.',
            'photo.file' => 'the item must be a file type.',
            'photo.mimes' => 'the images must be in jpg and png.',
        ];
    }
}
