<?php

namespace App\Contracts;

/**
 * Implemented by every domain event that should notify admins and tanods.
 * One listener (NotifyStaff) handles all of them.
 */
interface NotifiesStaff
{
    /** The notifications.notification_type value, e.g. 'report-notification'. */
    public function notificationType(): string;

    /** The notifications.item_id value: the id of the thing that was created. */
    public function itemId(): int;

    /** The live (websocket) event the web already listens for. */
    public function liveEvent(): object;
}