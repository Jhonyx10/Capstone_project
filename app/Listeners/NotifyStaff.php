<?php

namespace App\Listeners;

use App\Contracts\NotifiesStaff;
use App\Services\NotificationService;
use Throwable;

class NotifyStaff
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(NotifiesStaff $event): void
    {
        // The record is already saved. A failed notification (database or
        // websocket server down) is logged but must not turn a successful
        // API response into a 500.
        try {
            // 1. Store the row first, so the web's refetch after the toast finds it.
            $this->notifications->saveNotification(
                $event->notificationType(),
                $event->itemId(),
            );

            // 2. Then push it live to the dashboard.
            event($event->liveEvent());

            // 3. Firebase goes here later, e.g.
            //    $this->notifications->sendToAdminsAndTanods();
        } catch (Throwable $e) {
            report($e);
        }
    }
}