<?php

use App\Http\Controllers\Api\Admin\AuthController;
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
});
