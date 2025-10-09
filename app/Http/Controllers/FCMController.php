<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class FCMController extends Controller
{
    public function sendFCMNotification()
    {   
        // Your FCM token

        $token ='fQXRJ9y8S-CuVpiy0Xlojy:APA91bFALPXek98N11-ZbY6kXNwtOYMeIVhJXxmHsA0O4zQ1S7aw5bdoG9mwG6-DC96vbEsGY6yqvmTBvrx1s0-8O_TqpOsjTM18q86wNw1skZrKJMXri2E';
        // $token = 'dwf8MB2tTwyDQFuEICwiQa:APA91bGjoLC2etvRUXz7xbaroQIJj8ZyRSDoAiALaS1CumYIutBsSC1paFGTJzu6HRT-M95ZGydiqpV1Wo7hK6TIHanWBydAH79pYJE5Yru5BvQrqAcPpbI';
        // $token = 'einlHj_GRT-9nx081NAzaK:APA91bGnX-hWrnmyWeDQRhyyJLRH5RDHB1H549qfbN16lMvhpuCdJK90Ur57l52X1Y9SoH_Vyy2jmJ2LCcK8fyhipm0i-7d9-PcrZVMSH3dDtwHz_uqkGwg';
       $serviceAccountPath = config('services.firebase.key_path');
       
       if (!$serviceAccountPath) {
           return response()->json(['error' => 'Firebase credentials not set'], 500);
       }
       // Create the Firebase instance
       $factory = (new Factory)->withServiceAccount($serviceAccountPath);

       // Get the messaging instanced
       $messaging = $factory->createMessaging();

    //Create the message
       $message = CloudMessage::withTarget('token', $token)

    ->withData([
        'title' => 'Test12',
        'body'  => 'This is a test message for us',
    ])
    ->withAndroidConfig([
        'priority' => 'high',
    ]);


       // Send the message
       try {
           $messaging->send($message);
           return response()->json(['message' => 'Notification sent successfully']);
       } catch (\Exception $e) {
           return response()->json(['error' => $e->getMessage()], 500);
       }
   }


}