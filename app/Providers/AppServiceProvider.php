<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Notifications\ChannelManager;
use NotificationChannels\Fcm\FcmChannel;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register 'fcm' driver alias so channel can be referenced as 'fcm' or FcmChannel::class
        try {
            $this->app->make(ChannelManager::class)->extend('fcm', function ($app) {
                return $app->make(FcmChannel::class);
            });
        } catch (\Throwable $e) {
            // Ignore if notification manager is not yet bound
        }
    }
}
