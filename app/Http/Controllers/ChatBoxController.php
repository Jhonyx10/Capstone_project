<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Services\ChatBoxService;
use App\Events\ChatBoxEvent;

class ChatBoxController extends Controller
{
    protected $chatBox;

    public function __construct(ChatBoxService $chatBox)
    {
        $this->chatBox = $chatBox;
    }

    public function getMessages($id)
    {
        $messages = $this->chatBox->getMessages($id);

        return response()->json(['messages' => $messages]);
    }

    public function sendMessage(Request $request)
    {
        $data = $request->validate([
            'request_id' => 'required|exists:incident_request_responses,id',
            'message' => 'required'
        ]);

        $chatMessage = $this->chatBox->createMessage($data);
        $status = $this->chatBox->updateStatus($data['request_id']);

        broadcast(new ChatBoxEvent($chatMessage));

        return response()->json(['message' => $chatMessage]);
    }
}
