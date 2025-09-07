<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserDevice;

class UserDeviceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $deviceTokens = $user->devices()->pluck('device_token');

        return response()->json([
            'status' => 'success',
            'tokens' => $deviceTokens
        ]);
    }


    public function store(Request $request)
    {
        $request->validate([
            'device_token' => 'required|string',
        ]);

        $user = $request->user();

        $userDevice = UserDevice::updateOrCreate(
            ['device_token' => $request->device_token], 
            ['user_id' => $user->id]                    
        );

        return response()->json([
            'status' => 'success',
            'device' => $userDevice
        ]);
    }

}
