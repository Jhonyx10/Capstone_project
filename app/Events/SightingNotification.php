<?php

namespace App\Events;

use App\Http\Resources\SightingReportResource;
use App\Models\SightingReport;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/** Same style as ReportSubmittedEvent / CreateViolatorEvent. */
class SightingNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public SightingReport $sighting) {}

    public function broadcastOn()
    {
        return ['sighting-submitted-channel'];
    }

    public function broadcastAs()
    {
        return 'sighting-submitted-event';
    }

    public function broadcastWith()
    {
        // API-shaped payload under `sighting`, like `violator` / `report`
        return [
            'sighting' => (new SightingReportResource($this->sighting))->resolve(),
        ];
    }
}