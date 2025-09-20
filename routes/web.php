<?php

use Illuminate\Support\Facades\Route;
use BeyondCode\LaravelWebSockets\Dashboard\Http\Controllers\WebSocketsController;
use Illuminate\Support\Facades\Broadcast;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/
Broadcast::routes(['middleware' => ['web', 'auth']]);

Route::get('/', function () {
    return view('welcome');
});

Route::get('/send', function () {
    broadcast(new App\Events\RequestResponseEvent('Hello from Pusher!'));
    return 'Sent!';
});

Route::get('/debug-firebase-path', function () {
    $credentialsPath = config('firebase.credentials');

    echo "Configured path: " . $credentialsPath . "<br>";

    if (file_exists($credentialsPath)) {
        echo "✅ File exists and is readable!";
    } else {
        echo "❌ File does NOT exist or is not readable.";
    }

    echo "<br>Absolute storage path: " . storage_path(env('FIREBASE_CREDENTIALS_PATH'));
});

Route::get('/firebase-test-notify', function() {
    $firebase = new \App\Services\FirebaseService();
    return $firebase->sendNotificationByRole('admin', 'Test Title', 'Test body');
});

Route::get('/firebase-test-1', function () {
    $firebase = new \App\Services\FirebaseService();

    $result = $firebase->sendNotificationByRole(
        'admin',
        'Test Notification',
        'This is a test message',
        ['key' => 'value']
    );

    return $result;
});

