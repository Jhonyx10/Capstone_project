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

    public function register(CreateAccountRequest $request)
    {
        $registerUser = $this->userService->createUser($request->validated());

        $token = $registerUser->createToken('auth_token')->plainTextToken;

           return response([
            'message' => 'Login successful.',
            'user' => $registerUser,
            'token' => $token,
        ]);
    }

    public function logout()
    {
         auth()->user()->tokens()->delete();

         return response()->json(['message' => 'logout successful']);
    }
}
