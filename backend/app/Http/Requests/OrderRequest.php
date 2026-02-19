<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items'                  => 'required|array|min:1',
            'items.*.item_id'        => 'required|integer|exists:items,id',
            'items.*.title'          => 'required|string|max:255',
            'items.*.price'          => 'required|numeric|min:0',
            'items.*.quantity'       => 'required|integer|min:1',
            'items.*.total'          => 'required|numeric|min:0',
            'payment_method'         => 'sometimes|in:cash,card,mobile',
            'discount'               => 'sometimes|numeric|min:0',
            'tax'                    => 'sometimes|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'              => 'Cart is empty. Please add items before placing an order.',
            'items.min'                   => 'At least one item is required.',
            'items.*.item_id.exists'      => 'One or more items no longer exist in the menu.',
            'items.*.quantity.min'        => 'Item quantity must be at least 1.',
            'items.*.price.min'           => 'Item price cannot be negative.',
        ];
    }
}
