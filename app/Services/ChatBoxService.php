<?php

namespace App\Services;

use App\Models\ChatBoxModel;
use App\Models\IncidentRequestResponse;

class ChatBoxService
{
    // Your service logic here

   public function messages(int $requestId): ChatBoxModel
    {
        return ChatBoxModel::create([
            'request_id' => $requestId,
            'user_id' => auth()->id(),
            'message' => 'Requesting Incident Response.',
        ]);
    }
    
    public function getMessages(int $id)
    {
        return ChatBoxModel::with('users')->where('request_id', $id)->get();
    }

    public function createMessage(array $data): ChatBoxModel
    {
        return ChatBoxModel::create([
            'request_id' => $data['request_id'],
            'user_id' => auth()->id(),
            'message' => $data['message'],
        ]);
    }

    public function updateStatus(int $id)
    {
        $status = IncidentRequestResponse::findOrFail($id);
        $status->status = "ongoing";
        $status->save();
    }
}