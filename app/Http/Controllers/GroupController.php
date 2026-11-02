<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use App\Services\GroupService;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    protected $groups;

    public function __construct(GroupService $groups)
    {
        $this->groups = $groups;
    }

    // all groups with their current members
    public function index()
    {
        $groups = Group::with('users:id,name')
            ->withCount('users')
            ->orderBy('name')
            ->get();

        return response()->json([
            'groups' => $groups,
        ], 200);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $group = Group::create($data);

        return response()->json([
            'message' => 'Group created successfully.',
            'group' => $group,
        ], 201);
    }

    // assign a tanod to a group, or move them from their current one
    public function assign(Request $request, $id)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $assignment = $this->groups->assign(
            userId: (int) $data['user_id'],
            groupId: (int) $id,
            assignedBy: $request->user()->id,
            reason: $data['reason'] ?? null,
        );

        return response()->json([
            'message' => 'Tanod assigned successfully.',
            'assignment' => $assignment->load('group:id,name', 'user:id,name'),
        ], 200);
    }

    // remove a tanod from their current group
    public function unassign($userId)
    {
        User::findOrFail($userId);

        $this->groups->unassign((int) $userId);

        return response()->json([
            'message' => 'Tanod removed from group.',
        ], 200);
    }

    // a tanod's past and current groups
    public function history($userId)
    {
        User::findOrFail($userId);

        return response()->json([
            'history' => $this->groups->history((int) $userId),
        ], 200);
    }

    // group details: admins can view any group, tanods only their own
    public function show(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role === 'tanod' && ! $this->groups->isMember($user->id, (int) $id)) {
            return response()->json([
                'message' => 'You are not a member of this group.',
            ], 403);
        }

        return response()->json([
            'group' => $this->groups->details((int) $id),
        ], 200);
    }

    // the logged-in tanod's current group (null if unassigned)
    public function myGroup(Request $request)
    {
        return response()->json([
            'group' => $this->groups->myGroup($request->user()->id),
        ], 200);
    }
}