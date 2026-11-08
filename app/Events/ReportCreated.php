<?php

namespace App\Events;

use App\Contracts\NotifiesStaff;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReportCreated implements NotifiesStaff, ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    public function __construct(public Model $report) {}

    public function notificationType(): string
    {
        return 'report-notification';
    }

    public function itemId(): int
    {
        return $this->report->id;
    }

    public function liveEvent(): object
    {
        return new ReportSubmittedEvent($this->report);
    }
}