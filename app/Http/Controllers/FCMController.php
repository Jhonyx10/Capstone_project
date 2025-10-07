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

        $token ='fIo5Db_JSUefugkZ_tXLWP:APA91bGuICA8KyrP_zCk8-Z2U0b5d70jh6RQYw3jBcS4H1Qi7q8mbsSD6vMpYb5IOEJqSpgLZ97ODEi5qjCb82aCHz9hh5-3kvyaXre-Kg38BCLrtM_DRxo';
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