<?php

namespace App\Services;

use App\Models\User;
use App\Http\Requests\CreateAccountRequest;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function createUser(CreateAccountRequest $request): User
    {
        $data = $request->validated();
        
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
        ]);
    }

   public function deleteUser(int $id): bool
    {
        $user = User::findOrFail($id);
        return $user->delete();
    }

    public function updateUser(int $id, array $data): User
    {
        $user = User::findOrFail($id);

        $user->name = $data['name'] ?? $user->name;
        $user->email = $data['email'] ?? $user->email;

        if(isset($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return $user;
    }

    public function getUsers()
    {
        return $user = User::where('role', 'tanod')->get();
    }

    public function showUser(int $id):User
    {
        return $user = User::findOrFail($id);
    }
}
