<?php

namespace App\Services;

use App\Models\Group;
use App\Models\GroupAssignment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GroupService
{
    public function assign(int $userId, int $groupId, ?int $assignedBy = null, ?string $reason = null): GroupAssignment
    {
        return DB::transaction(function () use ($userId, $groupId, $assignedBy, $reason) {
            // lock the user so two requests can't both give them an active group
            $user = User::lockForUpdate()->findOrFail($userId);
            $group = Group::lockForUpdate()->findOrFail($groupId);

            if ($user->role !== 'tanod') {
                throw ValidationException::withMessages([
                    'user' => 'Only tanods can be assigned to a group.',
                ]);
            }

            $current = GroupAssignment::active()->where('user_id', $userId)->first();

            // already in this group, nothing to do
            if ($current && $current->group_id === $groupId) {
                return $current;
            }

            if ($group->assignments()->active()->count() >= $group->capacity) {
                throw ValidationException::withMessages([
                    'group' => 'This group is already full.',
                ]);
            }

            // close the old assignment, then open the new one
            $current?->update(['ended_at' => now()]);

            return GroupAssignment::create([
                'group_id' => $groupId,
                'user_id' => $userId,
                'assigned_by' => $assignedBy,
                'assigned_at' => now(),
                'reason' => $reason,
            ]);
        });
    }

    // take someone out of their group without putting them in another
    public function unassign(int $userId): void
    {
        GroupAssignment::active()
            ->where('user_id', $userId)
            ->update(['ended_at' => now()]);
    }

    // a tanod's full history, newest first
    public function history(int $userId)
    {
        return GroupAssignment::with('group:id,name', 'assigner:id,name')
            ->where('user_id', $userId)
            ->orderByDesc('assigned_at')
            ->get();
    }

    // full details of one group, shaped for the API
    public function details(int $groupId): array
    {
        $group = Group::with('users:id,name')->findOrFail($groupId);

        $members = $group->users->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'assigned_at' => $user->pivot->assigned_at,
        ])->values();

        return [
            'id' => $group->id,
            'name' => $group->name,
            'capacity' => $group->capacity,
            'members_count' => $members->count(),
            'available_slots' => max($group->capacity - $members->count(), 0),
            'is_full' => $members->count() >= $group->capacity,
            'members' => $members,
            'created_at' => $group->created_at,
        ];
    }

    // the group a tanod currently belongs to, or null
    public function myGroup(int $userId): ?array
    {
        $assignment = GroupAssignment::active()->where('user_id', $userId)->first();

        return $assignment ? $this->details($assignment->group_id) : null;
    }

    public function isMember(int $userId, int $groupId): bool
    {
        return GroupAssignment::active()
            ->where('user_id', $userId)
            ->where('group_id', $groupId)
            ->exists();
    }
}