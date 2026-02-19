<?php

use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\ItemController;
use App\Http\Controllers\Api\Admin\OrderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('guest:sanctum')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Resend verification email
    Route::post('/email/check-status', [AuthController::class, 'checkVerificationStatus']); // NEW ROUTE
    Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])->name('verification.resend');

    // Forgot password && Reset password
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/validate-reset-token', action: [AuthController::class, 'validateResetToken']);



});

// Protected routes with authentication, email verification, and active status check
Route::middleware(['auth:sanctum', 'verified', 'user.status'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Categories
    Route::apiResource('categories', CategoryController::class);
    // Import and Bulk Delete Categories
    Route::post('categories/import', [CategoryController::class, 'import']);
    Route::post('categories/bulk-delete', [CategoryController::class, 'bulkDelete']);

    // Items
    Route::apiResource('items', ItemController::class);
    // Bulk Delete Items
    Route::post('items/bulk-delete', [ItemController::class, 'bulkDelete']);

    Route::prefix('orders')->controller(OrderController::class)->group(function () {
        Route::get('/',              'index');
        Route::post('/',             'store');
        Route::get('/{id}',          'show');
        Route::delete('/{id}',       'destroy');
        Route::patch('/{id}/status', 'updateStatus');
        Route::patch('/{id}/payment','updatePayment');  
    });

});
