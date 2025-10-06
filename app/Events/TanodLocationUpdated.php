<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class TanodLocationUpdated implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $requestId;
    public $tanodId;
    public $latitude;
    public $longitude;

    public function __construct($requestId,$tanodId, $latitude, $longitude)
    {
        $this->requestId = $requestId;
        $this->$tanodId = $tanodId;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
    }

    public function broadcastOn()
    {
        return new Channel('locations'); 
    }

    public function broadcastAs()
    {
        return 'location.updated';
    }
}