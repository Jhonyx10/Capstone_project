<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ProfileRequest extends FormRequest
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
            'user_id' => 'required|exists:users,id',
            'last_name' => 'required|string',
            'first_name' => 'required|string',
            'age' => 'required|integer',
            'address' => 'required|string',
            'photo' => 'required|file|mimes:jpg,png|max:2048',
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
            'user_id.exists' => 'user not found',
            'last_name.required' => 'please provide your last name.',
            'first_name.required' => 'please provide your first name.',
            'age.required' => 'please provide your age.',
            'address.required' => 'please provide your address.',
            'photo.required' => 'please provide your picture.',
            'photo.mimes' => 'the provided image must be in png and jpg.',
        ];
    }
}
