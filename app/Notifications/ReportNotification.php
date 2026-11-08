<?php

namespace App\Notifications;

class ReportNotification extends ItemNotification
{
    protected function typeKey(): string { return 'report-notification'; }
    protected function title(): string { return 'New Report'; }
    protected function body(): string { return 'A new report has been submitted.'; }
}