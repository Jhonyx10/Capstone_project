<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CreateViolatorEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $violator;

    public function __construct($violator)
    {
        $this->violator = $violator;
    }

   public function broadcastOn()
    {
        return ['violator-submitted-channel'];
    }

    public function broadcastAs()
    {
        return 'violator-submitted-event';
    }

    public function broadcastWith()
    {
        return [
            'message' => 'created successfully.',
            'violator' => $this->violator,
        ];
    }

}
