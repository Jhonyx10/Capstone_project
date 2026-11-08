<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

abstract class ItemNotification extends Notification
{
    public function __construct(public int $itemId) {}

    abstract protected function title(): string;
    abstract protected function body(): string;
    abstract protected function typeKey(): string;

    protected function isFcmConfigured(): bool
    {
        $firebaseCredentials = config('firebase.projects.app.credentials');
        if (is_string($firebaseCredentials) && is_file($firebaseCredentials) && is_readable($firebaseCredentials)) {
            return true;
        }

        $servicesKey = config('services.firebase.key_path');
        if (is_string($servicesKey) && is_file($servicesKey) && is_readable($servicesKey)) {
            return true;
        }

        return false;
    }

    public function via($notifiable): array
    {
        $channels = ['database'];

        if ($this->isFcmConfigured() && ! empty($notifiable->routeNotificationFor('fcm', $this))) {
            $channels[] = FcmChannel::class;
        }

        return $channels;
    }

    public function toArray($notifiable): array
    {
        return [
            'item_id' => $this->itemId,
            'notification_type' => $this->typeKey(),
            'title' => $this->title(),
            'body' => $this->body(),
        ];
    }

    public function toFcm($notifiable): FcmMessage
    {
        return (new FcmMessage(notification: new FcmNotification(
            title: $this->title(),
            body: $this->body(),
        )))->data([
            'item_id' => (string) $this->itemId,
            'notification_type' => $this->typeKey(),
        ]);
    }
}
