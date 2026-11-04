<?php

namespace App\Policies;

use App\Models\SightingReport;
use App\Models\User;

class SightingReportPolicy
{
    /** ⚠️ Adjust the role names to match your users.role values. */
    public static function isStaff(User $user): bool
    {
        return in_array($user->role, ['admin', 'tanod', 'resident'], true);
    }

    public function viewAny(User $user): bool
    {
        return true; // the list is scoped to the user's own sightings in the controller
    }

    public function view(User $user, SightingReport $sighting): bool
    {
        return self::isStaff($user) || $sighting->reporter_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SightingReport $sighting): bool
    {
        return $sighting->reporter_id === $user->id || $user->role === 'admin';
    }

    public function delete(User $user, SightingReport $sighting): bool
    {
        return $sighting->reporter_id === $user->id || $user->role === 'admin';
    }
}