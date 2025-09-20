<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReportSubmittedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $report; 

    public function __construct($report)
    {
        $this->report = $report->load(['location', 'violators', 'evidences', 'incidentType.category']);
    }

   public function broadcastOn()
    {
        return ['report-submitted-channel'];
    }

    public function broadcastAs()
    {
        return 'report-submitted-event';
    }
}