<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    // Your service logic here

    public function userLogin(array $data): User
    {
          $user = User::with('profile')->where('name', $data['name'])->first();

       if (!$user) {
            throw ValidationException::withMessages([
                'name' => ["The provided username doesn't exist."],
            ]);
        }

        if (!Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => ["The provided password is incorrect."],
            ]);
        }

        return $user;
    }


}