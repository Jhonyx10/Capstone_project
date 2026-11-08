<?php

namespace App\Notifications;

class ViolatorsNotification extends ItemNotification
{
    protected function typeKey(): string { return 'violators-notification'; }
    protected function title(): string { return 'New Violator'; }
    protected function body(): string { return 'A new violator has been recorded.'; }
}