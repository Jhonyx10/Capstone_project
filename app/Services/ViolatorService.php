<?php

namespace App\Services;

use App\Models\ViolatorsProfile;

class ViolatorService
{
    public function getViolatorsDetails(int $id): ViolatorsProfile
    {
        $violator = ViolatorsProfile::with(['zone', 'reports'])->findOrFail($id);
        $violator->photo = asset('storage/' . $violator->photo);

        return $violator;
    }
}
