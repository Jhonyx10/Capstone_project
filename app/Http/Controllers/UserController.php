<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\CreateAccountRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\ProfileRequest;
use App\Services\UserService;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index()
    {
        //
        $users = $this->userService->getUsers();

        return response()->json([
            'message' => 'Users Fetch Successfully',
            'users' => $users,
        ], 200);
    }
    
    /**
     * Store a newly created resource in storage.
     */
   public function store(CreateAccountRequest $request)
    {
        $user = $this->userService->createUser($request);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
        $user = $this->userService->showUser((int) $id);

        return response()->json([
            'message' => 'User Details Successfully Fetch',
            'user' => $user
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, string $id)
    {
        //
         $user = $this->userService->updateUser((int) $id, $request->validated());

         return response()->json([
            'message' => 'User created successfully.',
            'user' => $user,
        ], 201);

    }

    /**
     * Remove the specified resource from storage.
     */
   public function destroy($id)
    {
        $deleted = $this->userService->deleteUser($id);

        return response()->json([
            'message' => $deleted ? 'User deleted successfully.' : 'Failed to delete user.',
        ]);
    }

    public function addProfile(ProfileRequest $request)
    {
        $profile = $this->userService->addProfile($request);

         return response()->json([
            'message' => 'Profile created successfully.',
            'profile' => $profile,
        ], 201);
    }
}
