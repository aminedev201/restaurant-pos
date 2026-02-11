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
                'data' =>  $categories
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function store(CategoryRequest $request)
    {
        try {
            $category = Category::create([
                'name' => $request->name,
                'description' => $request->description,
                'user_id' => Auth::user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data' => $category
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Category creation failed',
                'error' => $e->getMessage()
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
                'data' => $category
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve category',
                'error' => $e->getMessage()
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
                'name' => $request->name,
                'description' => $request->description,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => $category
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Category update failed',
                'error' => $e->getMessage()
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
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function import(Request $request)
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'categories' => 'required|array',
                'categories.*.name' => 'required|string|min:2|max:255',
                'categories.*.description' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            $categories = $request->categories;
            $userId = Auth::user()->id;
            $imported = 0;
            $already_exists = 0;
            $total = count($categories);

            // Get existing category names for this user
            $existingNames = Category::where('user_id', $userId)
                ->pluck('name')
                ->map(function($name) {
                    return strtolower($name);
                })
                ->toArray();

            // Prepare categories for batch insert
            $categoriesToInsert = [];
            $now = now();

            foreach ($categories as $category) {
                // Skip if name already exists (case-insensitive)
                if (in_array(strtolower($category['name']), $existingNames)) {
                    $already_exists++;
                    continue;
                }

                // Add to insert array
                $categoriesToInsert[] = [
                    'name' => $category['name'],
                    'description' => $category['description'] ?? null,
                    'user_id' => $userId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                // Add to existing names to prevent duplicates in same batch
                $existingNames[] = strtolower($category['name']);
                $imported++;
            }

            // Batch insert all categories at once
            if (!empty($categoriesToInsert)) {
                DB::table('categories')->insert($categoriesToInsert);
            }

            return response()->json([
                'success' => true,
                'message' => 'Categories import completed',
                'data' => [
                    'total' => $total,
                    'imported' => $imported,
                    'already_exists' => $already_exists,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function bulkDelete(Request $request)
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'ids' => 'required|array|min:1',
                'ids.*' => 'required|integer',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            $userId = Auth::user()->id;
            $requestedIds = $request->ids;

            // Get all category IDs that belong to the current user
            $userCategoryIds = Category::where('user_id', $userId)
                ->pluck('id')
                ->toArray();

            // Filter: Only keep IDs that exist AND belong to the current user
            $validIds = [];
            $skippedIds = [];

            foreach ($requestedIds as $id) {
                if (in_array($id, $userCategoryIds)) {
                    $validIds[] = $id;
                } else {
                    $skippedIds[] = $id;
                }
            }

            // Check if there are any valid IDs to delete
            if (empty($validIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid categories to delete. All IDs are either invalid or do not belong to you.',
                    'data' => [
                        'skipped' => count($skippedIds),
                        'deleted' => 0
                    ]
                ], 403);
            }

            // Delete only the valid categories
            $deleted = Category::where('user_id', $userId)
                ->whereIn('id', $validIds)
                ->delete();

            $message = 'Categories deleted successfully';
            if (count($skippedIds) > 0) {
                $message = "Deleted {$deleted} categories. Skipped {count($skippedIds)} unauthorized or invalid categories.";
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'deleted' => $deleted,
                    'skipped' => count($skippedIds),
                    'valid_ids' => $validIds,
                    'skipped_ids' => $skippedIds
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
