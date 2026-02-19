<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    public function index()
    {
        try {
            $categories = Category::where('user_id', Auth::user()->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Categories retrieved successfully',
                'data'    => $categories
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve categories',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function store(CategoryRequest $request)
    {
        try {
            $category = Category::create([
                'name'        => $request->name,
                'description' => $request->description,
                'icon'        => $request->icon,
                'user_id'     => Auth::user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data'    => $category
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Category creation failed',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function show($id)
    {
        try {
            $category = Category::where('id', $id)
                ->where('user_id', Auth::user()->id)
                ->first();

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Category retrieved successfully',
                'data'    => $category
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve category',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function update(CategoryRequest $request, $id)
    {
        try {
            $category = Category::where('id', $id)
                ->where('user_id', Auth::user()->id)
                ->first();

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            $category->update([
                'name'        => $request->name,
                'description' => $request->description,
                'icon'        => $request->icon,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data'    => $category
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Category update failed',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function destroy($id)
    {
        try {
            $category = Category::where('id', $id)
                ->where('user_id', Auth::user()->id)
                ->first();

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Category deletion failed',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function import(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'categories'             => 'required|array',
                'categories.*.name'      => 'required|string|min:2|max:255',
                'categories.*.description' => 'nullable|string|max:1000',
                'categories.*.icon'      => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $categories    = $request->categories;
            $userId        = Auth::user()->id;
            $imported      = 0;
            $already_exists = 0;
            $total         = count($categories);

            $existingNames = Category::where('user_id', $userId)
                ->pluck('name')
                ->map(fn($name) => strtolower($name))
                ->toArray();

            $categoriesToInsert = [];
            $now = now();

            // Default icon used when importing without one
            $defaultIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>';

            foreach ($categories as $category) {
                if (in_array(strtolower($category['name']), $existingNames)) {
                    $already_exists++;
                    continue;
                }

                $categoriesToInsert[] = [
                    'name'        => $category['name'],
                    'description' => $category['description'] ?? null,
                    'icon'        => $category['icon'] ?? $defaultIcon,
                    'user_id'     => $userId,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ];

                $existingNames[] = strtolower($category['name']);
                $imported++;
            }

            if (!empty($categoriesToInsert)) {
                DB::table('categories')->insert($categoriesToInsert);
            }

            return response()->json([
                'success' => true,
                'message' => 'Categories import completed',
                'data'    => [
                    'total'         => $total,
                    'imported'      => $imported,
                    'already_exists' => $already_exists,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed',
                'error'   => $e->getMessage()
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
                    'errors'  => $validator->errors()
                ], 422);
            }

            $userId       = Auth::user()->id;
            $requestedIds = $request->ids;

            $userCategoryIds = Category::where('user_id', $userId)
                ->pluck('id')
                ->toArray();

            $validIds   = [];
            $skippedIds = [];

            foreach ($requestedIds as $id) {
                if (in_array($id, $userCategoryIds)) {
                    $validIds[] = $id;
                } else {
                    $skippedIds[] = $id;
                }
            }

            if (empty($validIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid categories to delete. All IDs are either invalid or do not belong to you.',
                    'data'    => ['skipped' => count($skippedIds), 'deleted' => 0]
                ], 403);
            }

            $deleted = Category::where('user_id', $userId)
                ->whereIn('id', $validIds)
                ->delete();

            $message = 'Categories deleted successfully';
            if (count($skippedIds) > 0) {
                $message = "Deleted {$deleted} categories. Skipped " . count($skippedIds) . " unauthorized or invalid categories.";
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data'    => [
                    'deleted'     => $deleted,
                    'skipped'     => count($skippedIds),
                    'valid_ids'   => $validIds,
                    'skipped_ids' => $skippedIds
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete categories',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
