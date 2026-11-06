<?php

namespace App\Services;

use App\Models\BlockedNumber;
use App\Models\User;
use App\Support\Phone;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class AuthService
{
    // Your service logic here

    public function userLogin(array $data): User
    {
          $user = User::with('profile','currentAssignment.group')->where('name', $data['name'])->first();

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

    public function register(array $data, UploadedFile $idPhoto): array
    {
        $phone = Phone::normalize($data['phone']);

        if (!$phone) {
            throw ValidationException::withMessages([
                'phone' => ['Enter a valid Philippine mobile number.'],
            ]);
        }

        $blocked = BlockedNumber::where('phone', $phone)
            ->orWhere('device_id', $data['device_id'])
            ->exists();

        if ($blocked) {
            throw ValidationException::withMessages([
                'phone' => ['You cannot register with this number or device.'],
            ]);
        }

        if (User::where('email', $phone)->exists()) {
            throw ValidationException::withMessages([
                'phone' => ['This number is already registered.'],
            ]);
        }

        // private disk (storage/app/private), not publicly accessible
        $path = $idPhoto->store('identification', 'local');

        $secret = Str::random(40);

        $user = User::create([
                'name'           => $data['name'],
                'email'          => $phone,
                'password'       => Hash::make($secret),
                'identification' => $idPhoto->store('identification', 'local'),
                'device_id'      => $data['device_id'],
                'role'           => 'resident',
                'status'         => 'pending',
            ]);

            return [$user, $secret];
    }

     public function residentLogin(array $data): User
    {
        $phone = Phone::normalize($data['phone']);
        abort_if(!$phone, 422, 'Invalid mobile number.');

        $user = User::where('email', $phone)->where('role', 'resident')->first();

        if (!$user) {
            abort(response()->json([
                'code' => 'NOT_REGISTERED',
                'message' => 'This number is not registered yet.',
            ], 404));
        }

        if (empty($data['secret']) || !Hash::check($data['secret'], $user->password)) {
            abort(response()->json([
                'code' => 'DEVICE_MISMATCH',
                'message' => 'This number is registered on another device. Please contact the barangay.',
            ], 401));
        }

        if ($user->status === 'blocked') {
            abort(response()->json(['code' => 'BLOCKED', 'message' => 'Your account has been blocked.'], 403));
        }

        return $user;
    }
}