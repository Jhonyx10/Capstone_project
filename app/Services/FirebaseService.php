<?php
namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\MulticastMessage;
use App\Models\UserDevice;

class FirebaseService
{
    protected $messaging;

    public function __construct()
    {
        $credentialsPath = config('services.firebase.key_path');

        if (!file_exists($credentialsPath) || !is_file($credentialsPath) || !is_readable($credentialsPath)) {
            throw new \Exception('Firebase credentials file not found or not readable at: ' . $credentialsPath);
        }

        $this->messaging = (new Factory())
            ->withServiceAccount($credentialsPath)
            ->createMessaging();
    }

    public function sendFCMNotification($title = 'Community Alert', $body = 'An incident has been reported. Please stay alert.')
    {
        // Get all device tokens
        $deviceTokens = UserDevice::pluck('device_token')->filter()->toArray();

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
            $report = $this->messaging->sendMulticast($message, $deviceTokens);
            return [
                'success' => $report->successes()->count(),
                'failed' => $report->failures()->count(),
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}
