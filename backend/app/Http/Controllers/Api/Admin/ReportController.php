<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * GET /api/admin/reports
     *
     * Query params:
     *   date_from  (Y-m-d)  default: 30 days ago
     *   date_to    (Y-m-d)  default: today
     *   group_by   day|week|month  default: day
     *   type       revenue|orders  default: revenue
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to'   => 'nullable|date|after_or_equal:date_from',
            'group_by'  => 'nullable|in:day,week,month',
            'type'      => 'nullable|in:revenue,orders',
        ]);

        $user    = $request->user();
        $from    = $request->filled('date_from')
            ? \Carbon\Carbon::parse($request->input('date_from'))->startOfDay()
            : now()->subDays(29)->startOfDay();

        $to      = $request->filled('date_to')
            ? \Carbon\Carbon::parse($request->input('date_to'))->endOfDay()
            : now()->endOfDay();
        $groupBy = $request->input('group_by', 'day');
        $type    = $request->input('type', 'revenue');

        return response()->json([
            'success' => true,
            'data'    => [
                'summary' => $this->summary($user, $from, $to),
                'rows'    => $this->rows($user, $from, $to, $groupBy, $type),
                'meta'    => [
                    'date_from' => $from->toDateString(),
                    'date_to'   => $to->toDateString(),
                    'group_by'  => $groupBy,
                    'type'      => $type,
                ],
            ],
        ]);
    }

    // ── Summary cards for the selected period ────────────────────────────────

    private function summary($user, $from, $to): array
    {
        $base = Order::where('user_id', $user->id)
            ->whereBetween('created_at', [$from, $to]);

        $totalOrders   = (clone $base)->count();
        $totalRevenue  = (clone $base)->where('payment_status', 'paid')->sum('total');
        $avgOrderValue = $totalOrders > 0
            ? round($totalRevenue / $totalOrders, 2)
            : 0;
        $completedOrders  = (clone $base)->where('status', 'completed')->count();
        $cancelledOrders  = (clone $base)->where('status', 'cancelled')->count();
        $pendingOrders    = (clone $base)->where('status', 'pending')->count();
        $processingOrders = (clone $base)->where('status', 'processing')->count();

        // Compare with previous period of same length
        $periodDays  = (int) $from->diffInDays($to) + 1;
        $prevFrom    = $from->copy()->subDays($periodDays)->startOfDay();
        $prevTo      = $from->copy()->subDay()->endOfDay();
        $prevBase    = Order::where('user_id', $user->id)
            ->whereBetween('created_at', [$prevFrom, $prevTo]);

        $prevOrders  = (clone $prevBase)->count();
        $prevRevenue = (clone $prevBase)->where('payment_status', 'paid')->sum('total');

        return [
            [
                'key'        => 'total_revenue',
                'title'      => 'Total Revenue',
                'value'      => round((float) $totalRevenue, 2),
                'formatted'  => '$' . number_format($totalRevenue, 2),
                'change'     => $this->percentChange($prevRevenue, $totalRevenue),
                'isPositive' => $totalRevenue >= $prevRevenue,
                'subtitle'   => 'vs previous period',
                'icon'       => 'revenue',
            ],
            [
                'key'        => 'total_orders',
                'title'      => 'Total Orders',
                'value'      => $totalOrders,
                'formatted'  => (string) $totalOrders,
                'change'     => $this->percentChange($prevOrders, $totalOrders),
                'isPositive' => $totalOrders >= $prevOrders,
                'subtitle'   => 'vs previous period',
                'icon'       => 'orders',
            ],
            [
                'key'        => 'avg_order_value',
                'title'      => 'Avg Order Value',
                'value'      => $avgOrderValue,
                'formatted'  => '$' . number_format($avgOrderValue, 2),
                'change'     => null,
                'isPositive' => true,
                'subtitle'   => 'per paid order',
                'icon'       => 'avg',
            ],
            [
                'key'        => 'completion_rate',
                'title'      => 'Completion Rate',
                'value'      => $totalOrders > 0 ? round(($completedOrders / $totalOrders) * 100, 1) : 0,
                'formatted'  => ($totalOrders > 0 ? round(($completedOrders / $totalOrders) * 100, 1) : 0) . '%',
                'change'     => null,
                'isPositive' => true,
                'subtitle'   => $completedOrders . ' completed orders',
                'icon'       => 'rate',
            ],
            [
                'key'       => 'status_breakdown',
                'pending'   => $pendingOrders,
                'processing'=> $processingOrders,
                'completed' => $completedOrders,
                'cancelled' => $cancelledOrders,
            ],
        ];
    }

    // ── Row data grouped by day / week / month ───────────────────────────────

    private function rows($user, $from, $to, string $groupBy, string $type): array
    {
        $selectFormat = match ($groupBy) {
            'week'  => "DATE_FORMAT(created_at, '%x-W%v')",  // ISO year-week
            'month' => "DATE_FORMAT(created_at, '%Y-%m')",
            default => 'DATE(created_at)',
        };

        $labelFormat = match ($groupBy) {
            'week'  => '%x-W%v',
            'month' => '%b %Y',
            default => '%d %b %Y',
        };

        $rows = Order::where('user_id', $user->id)
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw("
                {$selectFormat}                              AS period,
                DATE_FORMAT(MIN(created_at), '{$labelFormat}') AS label,
                COUNT(*)                                     AS total_orders,
                SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END) AS revenue,
                SUM(CASE WHEN status = 'completed'  THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN status = 'pending'    THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = 'cancelled'  THEN 1 ELSE 0 END) AS cancelled,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing,
                SUM(CASE WHEN payment_status = 'paid'     THEN 1 ELSE 0 END) AS paid_count,
                SUM(CASE WHEN payment_status = 'unpaid'   THEN 1 ELSE 0 END) AS unpaid_count,
                SUM(CASE WHEN payment_status = 'refunded' THEN 1 ELSE 0 END) AS refunded_count,
                AVG(total)                                   AS avg_order_value
            ")
            ->groupByRaw($selectFormat)
            ->orderByRaw('MIN(created_at)')
            ->get();

        return $rows->map(fn ($row) => [
            'period'          => $row->period,
            'label'           => $row->label,
            'total_orders'    => (int) $row->total_orders,
            'revenue'         => round((float) $row->revenue, 2),
            'revenue_formatted' => '$' . number_format($row->revenue, 2),
            'avg_order_value' => round((float) $row->avg_order_value, 2),
            'completed'       => (int) $row->completed,
            'pending'         => (int) $row->pending,
            'cancelled'       => (int) $row->cancelled,
            'processing'      => (int) $row->processing,
            'paid_count'      => (int) $row->paid_count,
            'unpaid_count'    => (int) $row->unpaid_count,
            'refunded_count'  => (int) $row->refunded_count,
        ])->values()->all();
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private function percentChange(float|int $old, float|int $new): ?float
    {
        if ($old == 0 && $new == 0) return null;
        if ($old == 0) return 100.0;
        return round((($new - $old) / $old) * 100, 1);
    }
}
