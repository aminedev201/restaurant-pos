<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ItemRequest;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ItemController extends Controller
{
    private function deleteImage(?string $imagePath): void
    {
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }
    }
    private function storeImage($file): string
    {
        $randomName = Str::uuid() . '_' . time() . '.' . $file->getClientOriginalExtension();
        return $file->storeAs('items', $randomName, 'public');
    }
    public function index()
    {
        try {
            $items = Item::where('user_id', Auth::id())
                ->with('category:id,name,icon')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Items retrieved successfully',
                'data'    => $items,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve items',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
    public function store(ItemRequest $request)
    {
        try {
            $imagePath = $this->storeImage($request->file('image'));

            $item = Item::create([
                'title'       => $request->title,
                'description' => $request->description,
                'price'       => $request->price,
                'image_path'  => $imagePath,
                'category_id' => $request->category_id,
                'user_id'     => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Item created successfully',
                'data'    => $item,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Item creation failed',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
    public function show($id)
    {
        try {
            $item = Item::where('id', $id)
                ->where('user_id', Auth::id())
                ->with('category:id,name,icon')
                ->first();

            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Item not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Item retrieved successfully',
                'data'    => $item,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve item',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
    public function update(ItemRequest $request, $id)
    {
        try {
            $item = Item::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Item not found',
                ], 404);
            }

            $imagePath = $item->image_path; // keep old image by default

            if ($request->hasFile('image')) {
                $this->deleteImage( $imagePath);
                $imagePath = $this->storeImage($request->file('image'));
            }

            $item->update([
                'title'       => $request->title,
                'description' => $request->description,
                'price'       => $request->price,
                'image_path'  => $imagePath,
                'category_id' => $request->category_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Item updated successfully',
                'data'    => $item,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Item update failed',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
    public function destroy($id)
    {
        try {
            $item = Item::where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Item not found',
                ], 404);
            }

            $this->deleteImage($item->image_path);
            $item->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item deleted successfully',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Item deletion failed',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
    public function bulkDelete(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'ids'   => 'required|array|min:1',
                'ids.*' => 'required|integer',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            $userId       = Auth::id();
            $requestedIds = $request->ids;

            // Fetch only items belonging to this user
            $userItems  = Item::where('user_id', $userId)
                ->whereIn('id', $requestedIds)
                ->get();

            $validIds   = $userItems->pluck('id')->toArray();
            $skippedIds = array_values(array_diff($requestedIds, $validIds));

            if (empty($validIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid items to delete. All IDs are either invalid or do not belong to you.',
                    'data'    => [
                        'deleted' => 0,
                        'skipped' => count($skippedIds),
                    ],
                ], 403);
            }

            // Delete each image from storage
            foreach ($userItems as $item) {
                $this->deleteImage($item->image_path);
            }

            $deleted = Item::where('user_id', $userId)
                ->whereIn('id', $validIds)
                ->delete();

            $message = 'Items deleted successfully';
            if (count($skippedIds) > 0) {
                $message = "Deleted {$deleted} items. Skipped " . count($skippedIds) . " unauthorized or invalid items.";
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data'    => [
                    'deleted'     => $deleted,
                    'skipped'     => count($skippedIds),
                    'valid_ids'   => $validIds,
                    'skipped_ids' => $skippedIds,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete items',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
