<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\ProfileRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Services\UserDTO;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function show(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => ['user' => UserDTO::format(Auth::user())],
        ]);
    }

    /**
     * Update the authenticated user's profile (name, email, optional avatar).
     */
    public function update(ProfileRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $avatarPath = $user->avatar; // keep existing by default

        if ($request->hasFile('avatar')) {
            $this->deleteFromStorage($user->avatar);

            $file       = $request->file('avatar');
            $extension  = $file->getClientOriginalExtension();
            $avatarPath = $file->storeAs('avatars', Str::uuid() . '.' . $extension, 'public');
        }

        $user->update([
            'name'   => $request->input('name'),
            'email'  => $request->input('email'),
            'avatar' => $avatarPath,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data'    => ['user' => UserDTO::format($user->fresh())],
        ]);
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(ProfileRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (! Hash::check($request->input('current_password'), $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
                'errors'  => [
                    'current_password' => ['Current password is incorrect.'],
                ],
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->input('password')),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }

    /**
     * Remove the authenticated user's avatar.
     */
    public function removeAvatar(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (! $user->avatar) {
            return response()->json([
                'success' => false,
                'message' => 'No avatar to remove.',
            ], 422);
        }

        $this->deleteFromStorage($user->avatar);

        $user->update(['avatar' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar removed successfully.',
            'data'    => ['user' => UserDTO::format($user->fresh())],
        ]);
    }

    /**
     * Permanently delete the authenticated user's account.
     * Revokes all tokens and removes avatar from storage.
     */
    public function destroy(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Revoke all Sanctum tokens
        $user->tokens()->delete();

        // Remove avatar from storage
        $this->deleteFromStorage($user->avatar);

        // Delete user record
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully.',
        ]);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    /**
     * Delete a file from the public disk only if it actually exists.
     */
    private function deleteFromStorage(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

}
