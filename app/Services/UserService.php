<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserProfile;
use App\Http\Requests\CreateAccountRequest;
use App\Http\Requests\ProfileRequest;
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
        return User::with('profile.zone')->where('role', 'tanod')
            ->get()
            ->map(function ($user) {
                if ($user->profile && $user->profile->photo) {
                    $user->profile->photo = asset('storage/' . $user->profile->photo);
                }
                 if (!$user->zone) {
                $user->zone_name = 'No Zone Assigned';
                } else {
                    $user->zone_name = $user->zone->name;
                }
                return $user;
            });
    }

    public function showUser(int $id):User
    {
        return $user = User::findOrFail($id);
    }

    public function addProfile(ProfileRequest $request): UserProfile
    {
        $data = $request->validated();

         if($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('photos','public');
        };

        return UserProfile::create([
            'user_id' => $data['user_id'],
            'last_name' => $data['last_name'],
            'first_name' => $data['first_name'],
            'age' => $data['age'],
            'zone_id' => $data['zone_id'],
            'address' => $data['address'],
            'photo' => $data['photo']
        ]);     
    }
}
