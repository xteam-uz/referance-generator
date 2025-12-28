<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'telegram_user_id' => 'required|integer|unique:users,telegram_user_id',
            'first_name' => 'required|string|min:3|max:255',
            'last_name' => 'required|string|min:3|max:255',
            'username' => 'nullable|string|max:255|unique:users,username',
            'email' => 'nullable|email|max:255|unique:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'telegram_user_id' => $request->telegram_user_id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username ?? null,
            'email' => $request->email ?? null,
            'password' => Hash::make($request->telegram_user_id),  // Telegram ID ni password sifatida ishlatamiz
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'telegram_user_id' => 'required|integer',
            'first_name' => 'required|string|min:3|max:255',
            'last_name' => 'required|string|min:3|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('telegram_user_id', $request->telegram_user_id)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found. Please register first.',
                'errors' => [
                    'telegram_user_id' => ["Foydalanuvchi topilmadi. Avval ro'yxatdan o'ting."],
                ],
            ], 404);
        }

        // Ma'lumotlarni yangilash
        $user->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
        ]);

        // Token yaratish
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user(),
            ],
        ]);
    }
}
