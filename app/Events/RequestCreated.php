<?php

namespace App\Events;

use App\Contracts\NotifiesStaff;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RequestCreated implements NotifiesStaff, ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    // the record returned by createResponseRequest()
    public function __construct(public Model $response) {}

    public function notificationType(): string
    {
        return 'request-notification';
    }

    public function itemId(): int
    {
        return $this->response->id;
    }

    public function liveEvent(): object
    {
        return new RequestResponseEvent($this->response);
    }
}