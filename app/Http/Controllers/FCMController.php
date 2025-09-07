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
        $token = 'cqG9TjhDTBi0O8bjt5MRuL:APA91bFOOP4l0N_a3uBCX5uaXIYL4oC2jOVX8kQ8dxJqko5h17Cl88oLrD2Ijn0tby4pvZb2Kwy6B71ivaUKz5bdYQHrVLqC751qLVfojDCRa_xPU2A8tSQ';
       $serviceAccountPath = public_path(env('FIREBASE_CREDENTIALS'));
       
       if (!$serviceAccountPath) {
           return response()->json(['error' => 'Firebase credentials not set'], 500);
       }
       // Create the Firebase instance
       $factory = (new Factory)->withServiceAccount($serviceAccountPath);

       // Get the messaging instanced
       $messaging = $factory->createMessaging();

    //    Create the message
       $message = CloudMessage::withTarget('token', $token)
           ->withNotification([
               'title' => 'Test12',
               'body' => 'This is a test message for us',
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