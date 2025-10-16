<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatBoxEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chatMessage;

    /**
     * Create a new event instance.
     */
    public function __construct($chatMessage)
    {
        $this->chatMessage = $chatMessage;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('new-message-channel'); // or PrivateChannel('new-message-channel')
    }

    /**
     * Optional: custom event name
     */
    public function broadcastAs(): string
    {
        return 'new-message-event';
    }

    /**
     * Optional: define payload
     */
    public function broadcastWith(): array
    {
        return [
            'chatMessage' => $this->chatMessage,
            'request_id' => $this->chatMessage->request_id,
        ];
    }
}
