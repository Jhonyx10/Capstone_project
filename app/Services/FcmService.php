<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class FcmService
{
    protected $client;
    protected $serverKey;
    protected $senderId;

    public function __construct()
    {
        $this->client = new Client();
        $this->serverKey = config('fcm.server_key');  // use config
        $this->senderId  = config('fcm.sender_id');   // use config
    }

    public function sendNotification($token, $title, $body, $data = [])
    {
        try {
            $response = $this->client->post('https://fcm.googleapis.com/fcm/send', [
                'headers' => [
                    'Authorization' => 'key=' . $this->serverKey,
                    'Content-Type'  => 'application/json',
                ],
                'json' => [
                    'to' => $token,
                    'notification' => [
                        'title' => $title,
                        'body'  => $body,
                    ],
                    'data' => $data,
                ],
            ]);

            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error("FCM send failed: " . $e->getMessage());
            return false;
        }
    }
}
