<?php

namespace App\Console\Commands;

use App\Models\NotificationModel;
use App\Models\User;
use App\Notifications\ReportNotification;
use App\Notifications\RequestNotification;
use App\Notifications\SightingNotification;
use App\Notifications\ViolatorsNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MigrateOldNotifications extends Command
{
    protected $signature = 'app:migrate-old-notifications';

    protected $description = 'Copy unread rows from notification_models into Laravel notifications';

    public function handle()
    {
        $users = User::whereIn('role', ['admin', 'tanod'])->get();

        $map = [
            'request-notification'   => RequestNotification::class,
            'report-notification'    => ReportNotification::class,
            'violators-notification' => ViolatorsNotification::class,
            'sighting-notification'  => SightingNotification::class,
        ];

        $count = 0;

        NotificationModel::where('status', false)->each(function ($old) use ($users, $map, &$count) {
            $class = $map[$old->notification_type] ?? null;

            if (! $class) {
                return;
            }

            $notification = new $class($old->item_id);

            foreach ($users as $user) {
                $user->notifications()->create([
                    'id'      => (string) Str::uuid(),
                    'type'    => $class,
                    'data'    => $notification->toArray($user),
                    'read_at' => null,
                ]);
                $count++;
            }
        });

        $this->info("Done. Created {$count} notifications.");
    }
}