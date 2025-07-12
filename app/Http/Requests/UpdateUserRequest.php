<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateUserRequest extends FormRequest
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
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email',
            'password' => 'min:8|max:16',
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
            'email.email' => 'The email must be a valid email address.',
            'email.unique' => 'This email is already in use.',
            'password.min' => 'The password must be at least 8 characters long.',
        ];
    }
}
