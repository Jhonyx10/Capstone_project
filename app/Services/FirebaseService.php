<?php
namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Illuminate\Support\Facades\Log;
use App\Models\UserDevice;

class FirebaseService
{
    protected $messaging = null;

    // No work in the constructor, so a missing credentials file
    // no longer crashes every controller that injects this service.
    public function __construct()
    {
    }

    // Builds the Firebase client the first time it is needed.
    protected function messaging()
    {
        if ($this->messaging) {
            return $this->messaging;
        }

        $credentialsPath = config('services.firebase.key_path');

        if (!$credentialsPath || !is_file($credentialsPath) || !is_readable($credentialsPath)) {
            Log::warning('Firebase credentials file not found or not readable at: ' . $credentialsPath);
            return null;
        }

        return $this->messaging = (new Factory())
            ->withServiceAccount($credentialsPath)
            ->createMessaging();
    }

    public function sendFCMNotification($title, $body)
    {
        $messaging = $this->messaging();

        if (!$messaging) {
            return ['error' => 'Firebase is not configured'];
        }

        // Get all device tokens
        $deviceTokens = UserDevice::whereHas('user', function ($q) {
            $q->where('role', 'tanod');
        })->pluck('device_token')->filter()->toArray();

        if (empty($deviceTokens)) {
            return ['error' => 'No device tokens found'];
        }

        // Create a multicast message
        $message = CloudMessage::new()
            ->withNotification([
                'title' => $title,
                'body' => $body,
            ])
            ->withAndroidConfig([
                'priority' => 'high',
            ]);

        try {
            $report = $messaging->sendMulticast($message, $deviceTokens);
            return [
                'success' => $report->successes()->count(),
                'failed' => $report->failures()->count(),
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}