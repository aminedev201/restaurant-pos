<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // ── GET /orders ───────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        try {
            $query = Order::where('user_id', Auth::id())
                ->with(['orderItems.item:id,title,image_path'])
                ->orderBy('created_at', 'desc');

            // Optional filters
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            if ($request->filled('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }
            if ($request->filled('date')) {
                $query->whereDate('created_at', $request->date);
            }

            $orders = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'message' => 'Orders retrieved successfully',
                'data'    => $orders,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve orders',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ── POST /orders ──────────────────────────────────────────────────────────
    public function store(OrderRequest $request)
    {
        DB::beginTransaction();
        try {
            $cartItems = $request->items;

            // Verify all items still exist and belong to this user
            $itemIds    = collect($cartItems)->pluck('item_id')->toArray();
            $validItems = Item::where('user_id', Auth::id())
                ->whereIn('id', $itemIds)
                ->get()
                ->keyBy('id');

            if ($validItems->count() !== count($itemIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some items were not found or do not belong to you.',
                ], 422);
            }

            // Calculate totals using DB prices (not client-sent prices) for security
            $subtotal = 0;
            $lineItems = [];

            foreach ($cartItems as $cartItem) {
                $dbItem   = $validItems[$cartItem['item_id']];
                $price    = (float) $dbItem->price;
                $quantity = (int) $cartItem['quantity'];
                $total    = $price * $quantity;
                $subtotal += $total;

                $lineItems[] = [
                    'item_id'  => $dbItem->id,
                    'title'    => $dbItem->title,      // snapshot from DB
                    'price'    => $price,               // snapshot from DB
                    'quantity' => $quantity,
                    'total'    => $total,
                ];
            }

            $discount = (float) ($request->discount ?? 0);
            $tax      = (float) ($request->tax ?? 0); // extend later
            $total    = max(0, $subtotal + $tax - $discount);

            // Create order
            $order = Order::create([
                'user_id'        => Auth::id(),
                'order_number'   => Order::generateOrderNumber(),
                'status'         => 'pending',
                'payment_status' => 'unpaid',
                'payment_method' => $request->payment_method ?? 'cash',
                'subtotal'       => $subtotal,
                'tax'            => $tax,
                'discount'       => $discount,
                'total'          => $total,
            ]);

            // Create order items
            foreach ($lineItems as $line) {
                OrderItem::create(array_merge($line, ['order_id' => $order->id]));
            }

            DB::commit();

            $order->load('orderItems.item:id,title,image_path');

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data'    => $order,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ── GET /orders/{id} ──────────────────────────────────────────────────────
    public function show($id)
    {
        try {
            $order = Order::where('id', $id)
                ->where('user_id', Auth::id())
                ->with('orderItems.item:id,title,image_path')
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order retrieved successfully',
                'data'    => $order,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve order',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ── PATCH /orders/{id}/status ─────────────────────────────────────────────
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,processing,completed,cancelled',
            ]);

            $order = Order::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found',
                ], 404);
            }

            $order->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated',
                'data'    => $order,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ── PATCH /orders/{id}/payment ────────────────────────────────────────────
    public function updatePayment(Request $request, $id)
    {
        try {
            $request->validate([
                'payment_status' => 'required|in:unpaid,paid,refunded',
                'payment_method' => 'sometimes|in:cash,card,mobile',
            ]);

            $order = Order::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found',
                ], 404);
            }

            $order->update($request->only('payment_status', 'payment_method'));

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated',
                'data'    => $order,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment status',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ── DELETE /orders/{id} ───────────────────────────────────────────────────
    public function destroy($id)
    {
        try {
            $order = Order::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found',
                ], 404);
            }

            $order->delete(); // cascades to order_items

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
