<?php

namespace App\Notifications;

class SightingNotification extends ItemNotification
{
    protected function typeKey(): string { return 'sighting-notification'; }
    protected function title(): string { return 'New Sighting'; }
    protected function body(): string { return 'A new sighting has been reported.'; }
}