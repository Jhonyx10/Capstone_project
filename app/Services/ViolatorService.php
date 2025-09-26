<?php

namespace App\Services;

use App\Models\ViolatorsProfile;
use App\Models\ViolatorsRecord;

class ViolatorService
{
    public function getViolatorsDetails(int $id): ViolatorsProfile
    {
        $violator = ViolatorsProfile::with(['zone', 'reports'])->findOrFail($id);
        $violator->photo = asset('storage/' . $violator->photo);

        return $violator;
    }

    public function violatorsRecords(int $id)
    {
        return ViolatorsRecord::with(['report.incidentType.category','report.location.zone'])
                                ->where('violator_id', $id)
                                ->get();
    }
}
