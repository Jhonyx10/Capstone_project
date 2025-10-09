<?php

namespace App\Services;

use Illuminate\Support\Facades\Notification;
use App\Notifications\TestNotification;
use App\Models\UserDevice;
use App\Models\NotificationModel;
use App\Models\User;

class NotificationService
{
    public function sendToAdminsAndTanods()
    {
        $users = User::whereIn('role', ['admin', 'tanod'])->pluck('id');

        $tokens = UserDevice::whereIn('user_id', $users)->pluck('device_token')->toArray();
        
        $serviceAccountPath = config('services.firebase.key_path');
       
        foreach ($tokens as $token) {
            Notification::route('fcm', $token)
                ->notify(new TestNotification());
        }

        return count($tokens); 
    }

    public function getNotifications()
    {
        return NotificationModel::where('status', false)->get();
    }

    public function saveRequestNotification(int $id): NotificationModel
    {
        return NotificationModel::create([
            'item_id' => $id,
            'notification_type' => 'request-notification',
        ]);
    }

     public function saveReportNotification(int $id): NotificationModel
    {
        return NotificationModel::create([
            'item_id' => $id,
            'notification_type' => 'report-notification',
        ]);
    }

     public function saveViolatorsNotification(int $id): NotificationModel
    {
        return NotificationModel::create([
            'item_id' => $id,
            'notification_type' => 'violators-notification',
        ]);
    }

    public function notificationStatusUpdate(int $id)
    {
        $notification = NotificationModel::findOrFail($id);
        $notification->status = 1;
        $notification->save();
    }
}
