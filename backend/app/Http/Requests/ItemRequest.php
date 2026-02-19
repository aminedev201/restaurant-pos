<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $itemId = $this->route('item');

        return [
            'title' => [
                'required',
                'string',
                'min:2',
                'max:255',
                Rule::unique('items', 'title')
                    ->where('user_id', Auth::id())
                    ->ignore($itemId)
            ],
            'description' => 'nullable|string|max:1000',
            'price'       => 'required|numeric|min:0|decimal:0,2',
            'image' => ($this->isMethod('POST') ? 'required' : 'nullable') . '|file|image|mimes:jpg,jpeg,png,gif,webp|max:10240',
            'category_id' => 'required|integer|exists:categories,id',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors'  => $validator->errors()
            ], 422)
        );
    }
}
