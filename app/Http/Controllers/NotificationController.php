<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $service) {}

    // Same shape the frontend already expects
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['notifications' => []]);
        }

        $unreadOnly = $request->boolean('unread_only') || $request->boolean('unread');
        $items = $this->service->getNotifications($user, $unreadOnly)
            ->map(fn ($n) => [
                'id'                => $n->id,
                'item_id'           => $n->data['item_id'] ?? null,
                'notification_type' => $n->data['notification_type'] ?? null,
                'title'             => $n->data['title'] ?? null,
                'message'           => $n->data['body'] ?? $n->data['title'] ?? null,
                'body'              => $n->data['body'] ?? null,
                'status'            => $n->read_at ? 1 : 0,
                'created_at'        => $n->created_at,
            ])
            ->values();

        return response()->json(['notifications' => $items]);
    }

    public function markAsRead(Request $request, string $id)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $notification = $this->service->markAsRead($user, $id);

        return response()->json([
            'message' => 'ok',
            'notification' => $notification,
        ]);
    }

    // Alias for markAsRead for backwards compatibility
    public function update(Request $request, string $id)
    {
        return $this->markAsRead($request, $id);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $this->service->markAllAsRead($user);
        }

        return response()->json(['message' => 'all marked as read']);
    }
}
