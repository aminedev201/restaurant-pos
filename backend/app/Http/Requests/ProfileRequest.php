<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return match ($this->route()->getName()) {
            'profile.update'          => $this->updateProfileRules(),
            'profile.change-password' => $this->changePasswordRules(),
            default                         => [],
        };
    }

    private function updateProfileRules(): array
    {
        $userId = Auth::id();

        return [
            'name'   => ['required', 'string', 'min:2', 'max:100'],
            'email'  => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ];
    }

    private function changePasswordRules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'confirmed', Password::min(8)->letters()->mixedCase()->numbers()],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'             => 'Full name is required.',
            'name.min'                  => 'Name must be at least 2 characters.',
            'email.required'            => 'Email address is required.',
            'email.unique'              => 'This email is already taken by another account.',
            'avatar.image'              => 'Avatar must be an image file.',
            'avatar.mimes'              => 'Avatar must be a JPEG, PNG, JPG, GIF or WEBP.',
            'avatar.max'                => 'Avatar may not be greater than 2MB.',
            'current_password.required' => 'Please enter your current password.',
            'password.required'         => 'New password is required.',
            'password.confirmed'        => 'Password confirmation does not match.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422)
        );
    }
}
