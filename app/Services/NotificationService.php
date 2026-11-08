<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\ReportNotification;
use App\Notifications\RequestNotification;
use App\Notifications\SightingNotification;
use App\Notifications\ViolatorsNotification;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\Notification as BaseNotification;
use Illuminate\Support\Collection;

class NotificationService
{
    protected function notifyUsers(iterable $users, BaseNotification $notification): int
    {
        $sent = 0;

        foreach ($users as $user) {
            try {
                $user->notify($notification);
                $sent++;
            } catch (\Throwable $e) {
                \Log::warning('Notification failed', [
                    'user' => $user->id,
                    'e'    => $e->getMessage(),
                ]);
            }
        }

        return $sent;
    }

    protected function recipients(?int $exceptUserId = null): Collection
    {
        return User::whereIn('role', ['admin', 'tanod'])
            ->when($exceptUserId, fn ($q) => $q->where('id', '!=', $exceptUserId))
            ->get();
    }

    protected function notifyStaff(BaseNotification $notification, ?int $exceptUserId = null): int
    {
        return $this->notifyUsers($this->recipients($exceptUserId), $notification);
    }

    public function notifyUserIds(array $userIds, BaseNotification $notification): int
    {
        return $this->notifyUsers(User::whereIn('id', $userIds)->get(), $notification);
    }

    public function sendRequestNotification(int $id): int
    {
        return $this->notifyStaff(new RequestNotification($id));
    }

    public function sendReportNotification(int $id): int
    {
        return $this->notifyStaff(new ReportNotification($id));
    }

    public function sendViolatorsNotification(int $id): int
    {
        return $this->notifyStaff(new ViolatorsNotification($id));
    }

    public function sendSightingNotification(int $id): int
    {
        return $this->notifyStaff(new SightingNotification($id));
    }

    public function getNotifications(User $user, bool $unreadOnly = false): Collection
    {
        if ($unreadOnly) {
            return $user->unreadNotifications()->latest()->get();
        }

        return $user->notifications()->latest()->take(30)->get();
    }

    public function markAsRead(User $user, string $notificationId): ?DatabaseNotification
    {
        $notification = $user->notifications()->find($notificationId);
        if ($notification) {
            $notification->markAsRead();
        }

        return $notification;
    }

    public function markAllAsRead(User $user): void
    {
        $user->unreadNotifications->markAsRead();
    }
}
