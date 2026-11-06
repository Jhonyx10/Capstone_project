<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\CreateAccountRequest;
use App\Services\AuthService;
use App\Services\UserService;
use App\Models\User;

class AuthController extends Controller
{
    //
    protected $authService;
    protected $userService;

    public function __construct(AuthService $authService, UserService $userService)
    {
        $this->authService = $authService;
        $this->userService = $userService;
    }

    public function login(LoginRequest $request)
    {
        $user = $this->authService->userLogin($request->validated());

        $token = $user->createToken('auth_token')->plainTextToken;

        return response([
            'message' => 'Login successful.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function register(Request $request, AuthService $auth)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100',
            'phone'     => 'required|string',
            'device_id' => 'required|string|max:255',
            'id_photo'  => 'required|image|max:4096',
        ]);

        [$user, $secret] = $auth->register($data, $request->file('id_photo'));

        return response()->json([
            'message' => 'Registration submitted. Please wait for approval.',
            'secret'  => $secret,
        ], 201);
    }

    public function residentLogin(Request $request, AuthService $auth)
    {
        $data = $request->validate([
            'phone'  => 'required|string',
            'secret' => 'nullable|string',
        ]);

        $user = $auth->residentLogin($data);

        return response()->json([
            'token'         => $user->createToken('resident')->plainTextToken,
            'user'          => $user,
            'status'        => $user->status,
            'reject_reason' => $user->status === 'rejected' ? $user->reject_reason : null,
        ]);
    }

    public function logout()
    {
         auth()->user()->tokens()->delete();

         return response()->json(['message' => 'logout successful']);
    }
    
}
