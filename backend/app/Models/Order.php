<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'payment_status',
        'payment_method',
        'subtotal',
        'tax',
        'discount',
        'total',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'tax'      => 'float',
        'discount' => 'float',
        'total'    => 'float',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Generate a unique order number like ORD-20240101-0042
     */
    public static function generateOrderNumber(): string
    {
        $date     = now()->format('Ymd');
        $last     = static::whereDate('created_at', today())->count() + 1;
        return 'ORD-' . $date . '-' . str_pad($last, 4, '0', STR_PAD_LEFT);
    }
}
