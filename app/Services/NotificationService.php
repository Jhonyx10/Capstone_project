<?php

namespace App\Services;

use Illuminate\Support\Facades\Notification;
use App\Notifications\TestNotification;
use App\Models\UserDevice;
use App\Models\User;

class NotificationService
{
    public function sendToAdminsAndTanods()
    {
        $users = User::whereIn('role', ['admin', 'tanod'])->pluck('id');

        $tokens = UserDevice::whereIn('user_id', $users)->pluck('device_token')->toArray();

        foreach ($tokens as $token) {
            Notification::route('fcm', $token)
                ->notify(new TestNotification());
        }

        return count($tokens); 
    }
}
