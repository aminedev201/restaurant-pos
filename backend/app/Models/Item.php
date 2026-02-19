<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Item extends Model
{
    protected $fillable = [
        'title',
        'description',
        'price',
        'image_path',
        'category_id',
        'user_id',
    ];

    protected $appends = ['image_path_url'];

    public function getImagePathUrlAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }

        return config('app.url') . Storage::url($this->image_path);
    }


    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
