<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class IncidentReportRequest extends FormRequest
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
            'incident_type_id' => 'required|exists:incident_types,id',
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
            'report_description' => 'required|string',
            'user_id' => 'required|exists:users,id'
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
            'incident_type_id.required' => 'Incident Type is required.',
            'date.required' => 'Date is required.',
            'time.required' => 'time is required.',
            'report_description.required' => 'report description is required.',
            'user_id.required' => 'user is required.'
        ];
    }
}
