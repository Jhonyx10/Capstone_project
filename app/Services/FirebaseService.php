<?php
namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use App\Models\User;

class FirebaseService
{
    protected $messaging;

    public function __construct()
    {
        $credentialsPath = storage_path(env('FIREBASE_CREDENTIALS_PATH', 'app/firebase/firebase-service-account.json'));

        if (!file_exists($credentialsPath) || !is_file($credentialsPath) || !is_readable($credentialsPath)) {
            throw new \Exception('Firebase credentials file not found or not readable at: ' . $credentialsPath);
        }

        $this->messaging = (new Factory())
            ->withServiceAccount($credentialsPath)
            ->createMessaging();
    }

    /**
     * Send notifications or data-only messages to all devices of users with given role(s).
     */
    public function sendNotificationByRole(array|string $roles, ?string $title = null, ?string $body = null, array $data = [])
    {
        if (!is_array($roles)) {
            $roles = [$roles];
        }

        $deviceTokens = User::whereIn('role', $roles)
            ->with('devices')
            ->get()
            ->pluck('devices.*.device_token')
            ->flatten()
            ->toArray();

        if (empty($deviceTokens)) {
            \Log::info('No device tokens found for roles', $roles);
            return ['status' => 'no_tokens'];
        }

        $success = 0;
        $failed = 0;

        foreach ($deviceTokens as $token) {
            // Build message
            $message = CloudMessage::withTarget('token', $token);

            if ($title && $body) {
                // Normal notification (title + body)
                $message = $message->withNotification(Notification::create($title, $body))
                                   ->withData(array_merge([
                                       'title' => $title,
                                       'body'  => $body,
                                   ], $data));
            } else {
                // Data-only message (just custom payload)
                $message = $message->withData($data);
            }

            try {
                $this->messaging->send($message);
                $success++;
            } catch (\Exception $e) {
                \Log::error('Failed to send FCM message to token '.$token.': ' . $e->getMessage());
                $failed++;
            }
        }

        return [
            'status' => 'success',
            'tokens_sent' => $deviceTokens,
            'success' => $success,
            'failed' => $failed,
        ];
    }
}
