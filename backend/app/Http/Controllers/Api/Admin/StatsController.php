<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    /**
     * GET /api/admin/stats
     *
     * Returns all dashboard statistics:
     *  - summary cards  (total orders, revenue, items, categories)
     *  - revenue chart  (last 7 days)
     *  - orders chart   (last 7 days by status)
     *  - top items      (best-selling by quantity)
     *  - recent orders  (last 5)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data'    => [
                'cards'         => $this->cards($user),
                'revenue_chart' => $this->revenueChart($user),
                'orders_chart'  => $this->ordersChart($user),
                'top_items'     => $this->topItems($user),
                'recent_orders' => $this->recentOrders($user),
            ],
        ]);
    }

    // ── Summary Cards ─────────────────────────────────────────────────────────

    private function cards(User $user): array
    {
        // ── Orders ──
        $totalOrders     = Order::where('user_id', $user->id)->count();
        $ordersThisMonth = Order::where('user_id', $user->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $ordersLastMonth = Order::where('user_id', $user->id)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();
        $ordersChange = $this->percentChange($ordersLastMonth, $ordersThisMonth);

        // ── Revenue ──
        $totalRevenue     = Order::where('user_id', $user->id)->where('payment_status', 'paid')->sum('total');
        $revenueThisMonth = Order::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total');
        $revenueLastMonth = Order::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('total');
        $revenueChange = $this->percentChange($revenueLastMonth, $revenueThisMonth);

        // ── Items ──
        $totalItems     = Item::where('user_id', $user->id)->count();
        $itemsThisMonth = Item::where('user_id', $user->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $itemsLastMonth = Item::where('user_id', $user->id)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();
        $itemsChange = $this->percentChange($itemsLastMonth, $itemsThisMonth);

        // ── Categories ──
        $totalCategories = Category::where('user_id', $user->id)->count();

        // ── Pending Orders ──
        $pendingOrders = Order::where('user_id', $user->id)->where('status', 'pending')->count();

        return [
            [
                'key'        => 'total_orders',
                'title'      => 'Total Orders',
                'value'      => $totalOrders,
                'formatted'  => (string) $totalOrders,
                'change'     => $ordersChange,
                'isPositive' => $ordersChange >= 0,
                'subtitle'   => $ordersThisMonth . ' this month',
                'icon'       => 'orders',
            ],
            [
                'key'        => 'total_revenue',
                'title'      => 'Total Revenue',
                'value'      => $totalRevenue,
                'formatted'  => '$' . number_format($totalRevenue, 2),
                'change'     => $revenueChange,
                'isPositive' => $revenueChange >= 0,
                'subtitle'   => '$' . number_format($revenueThisMonth, 2) . ' this month',
                'icon'       => 'revenue',
            ],
            [
                'key'        => 'total_items',
                'title'      => 'Menu Items',
                'value'      => $totalItems,
                'formatted'  => (string) $totalItems,
                'change'     => $itemsChange,
                'isPositive' => $itemsChange >= 0,
                'subtitle'   => $totalCategories . ' categories',
                'icon'       => 'items',
            ],
            [
                'key'        => 'pending_orders',
                'title'      => 'Pending Orders',
                'value'      => $pendingOrders,
                'formatted'  => (string) $pendingOrders,
                'change'     => null,
                'isPositive' => $pendingOrders === 0,
                'subtitle'   => 'awaiting processing',
                'icon'       => 'pending',
            ],
        ];
    }

    // ── Revenue Chart (last 7 days) ───────────────────────────────────────────

    private function revenueChart(User $user): array
    {
        $days = collect(range(6, 0))->map(fn ($i) => now()->subDays($i)->toDateString());

        $rows = Order::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [now()->subDays(6)->startOfDay(), now()->endOfDay()])
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders')
            ->groupBy('date')
            ->pluck('revenue', 'date');

        return $days->map(fn ($date) => [
            'date'    => $date,
            'label'   => \Carbon\Carbon::parse($date)->format('D'),
            'revenue' => round((float) ($rows[$date] ?? 0), 2),
        ])->values()->all();
    }

    // ── Orders Chart (last 7 days by status) ─────────────────────────────────

    private function ordersChart(User $user): array
    {
        $days = collect(range(6, 0))->map(fn ($i) => now()->subDays($i)->toDateString());

        $rows = Order::where('user_id', $user->id)
            ->whereBetween('created_at', [now()->subDays(6)->startOfDay(), now()->endOfDay()])
            ->selectRaw('DATE(created_at) as date, status, COUNT(*) as count')
            ->groupBy('date', 'status')
            ->get()
            ->groupBy('date');

        return $days->map(function ($date) use ($rows) {
            $group = $rows[$date] ?? collect();
            return [
                'date'       => $date,
                'label'      => \Carbon\Carbon::parse($date)->format('D'),
                'completed'  => (int) ($group->firstWhere('status', 'completed')?->count  ?? 0),
                'pending'    => (int) ($group->firstWhere('status', 'pending')?->count    ?? 0),
                'cancelled'  => (int) ($group->firstWhere('status', 'cancelled')?->count  ?? 0),
                'processing' => (int) ($group->firstWhere('status', 'processing')?->count ?? 0),
            ];
        })->values()->all();
    }

    // ── Top Items ─────────────────────────────────────────────────────────────

    private function topItems(User $user): array
    {
        return \App\Models\OrderItem::whereHas('order', fn ($q) => $q->where('user_id', $user->id))
            ->selectRaw('item_id, title, SUM(quantity) as total_qty, SUM(total) as total_revenue')
            ->groupBy('item_id', 'title')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'item_id'       => $row->item_id,
                'title'         => $row->title,
                'total_qty'     => (int) $row->total_qty,
                'total_revenue' => round((float) $row->total_revenue, 2),
            ])
            ->all();
    }

    // ── Recent Orders ─────────────────────────────────────────────────────────

    private function recentOrders(User $user): array
    {
        return Order::where('user_id', $user->id)
            ->with('orderItems')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($order) => [
                'id'             => $order->id,
                'order_number'   => $order->order_number,
                'status'         => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'total'          => round($order->total, 2),
                'items_count'    => $order->orderItems->sum('quantity'),
                'created_at'     => $order->created_at->toIso8601String(),
            ])
            ->all();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Percentage change from $old to $new, rounded to 1 decimal.
     * Returns null when there's no previous data to compare against.
     */
    private function percentChange(float|int $old, float|int $new): ?float
    {
        if ($old == 0 && $new == 0) return null;
        if ($old == 0) return 100.0;
        return round((($new - $old) / $old) * 100, 1);
    }
}
