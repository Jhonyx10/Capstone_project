<?php

namespace App\Notifications;

class RequestUpdatedNotification extends ItemNotification
{
    protected function typeKey(): string { return 'request-update-notification'; }
    protected function title(): string { return 'Request Update'; }
    protected function body(): string { return 'Your incident request has been updated.'; }
}