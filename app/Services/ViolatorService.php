<?php

namespace App\Services;

use App\Models\ViolatorsProfile;
use App\Models\ViolatorsRecord;

class ViolatorService
{
    public function getViolatorsDetails(int $id): ViolatorsProfile
    {
        $violator = ViolatorsProfile::with(['zone', 'reports.incidentType.category', 'reports.location.zone'])
                                    ->findOrFail($id);
        $violator->photo = asset('storage/' . $violator->photo);

        return $violator;
    }

    public function violatorsViolationCount()
    {
        return ViolatorsProfile::withCount(['violationRecords as total_violations' => function ($query) {
                            $query->join('incident_reports', 'incident_reports.id', '=', 'violators_records.report_id');
                            }])
                            ->orderByDesc('total_violations')
                            ->limit(5)
                            ->get(['id', 'first_name'])
                            ->map(function ($violator) {
                                if($violator->photo) {
                                    if(!str_starts_with($violator->photo, 'http')) {
                                        $violator->photo = asset('storage/'. $violator->photo);
                                    }
                                }
                            return $violator;
                            });
    }
}
