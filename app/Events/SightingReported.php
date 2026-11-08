<?php

namespace App\Events;

use App\Contracts\NotifiesStaff;
use App\Models\SightingReport;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SightingReported implements NotifiesStaff, ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    public function __construct(public SightingReport $sighting) {}

    public function notificationType(): string
    {
        return 'sighting-notification';
    }

    public function itemId(): int
    {
        return $this->sighting->id;
    }

    public function liveEvent(): object
    {
        return new SightingNotification($this->sighting);
    }
}