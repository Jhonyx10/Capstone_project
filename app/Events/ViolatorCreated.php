<?php

namespace App\Events;

use App\Contracts\NotifiesStaff;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ViolatorCreated implements NotifiesStaff, ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    public function __construct(public Model $violator) {}

    public function notificationType(): string
    {
        // plural, matching the value you already store
        return 'violators-notification';
    }

    public function itemId(): int
    {
        return $this->violator->id;
    }

    public function liveEvent(): object
    {
        return new CreateViolatorEvent($this->violator);
    }
}