<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('request.{requestId}', function ($user, $requestId) {
    return $user->id === Request::find($requestId)->user_id;
});


Broadcast::channel('request.{requestId}', function ($user, $requestId) {
    // Check if the user can listen to this request
    return auth()->check(); 
});
