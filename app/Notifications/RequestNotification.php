<?php

namespace App\Notifications;

class RequestNotification extends ItemNotification
{
    protected function typeKey(): string { return 'request-notification'; }
    protected function title(): string { return 'New Request'; }
    protected function body(): string { return 'A new request has been submitted.'; }
}