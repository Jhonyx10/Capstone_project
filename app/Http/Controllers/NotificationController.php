<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NotificationModel;
use App\Services\NotificationService;

class NotificationController extends Controller
{
    //

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index()
    {
        $notifications = $this->notificationService->getNotifications();

        return response()->json(['notifications' => $notifications]);
    }

    public function update($id)
    {
        $notification = $this->notificationService->notificationStatusUpdate($id);

        return response()->json(['notification' => $notification]);
    }
}
