<?php

namespace App\Services;

use App\Models\IncidentLocation;
use App\Models\IncidentReport;
use App\Models\IncidentEvidence;
use App\Models\ViolatorsProfile;
use App\Models\ViolatorsRecord;
use App\Http\Requests\IncidentLocationRequest;
use App\Http\Requests\IncidentReportRequest;
use App\Http\Requests\EvidenceRequest;
use App\Http\Requests\ViolatorsProfileRequest;
use App\Http\Requests\ViolatorsRecordRequest;


class IncidentReportService
{
    // Your service logic here
    public function addLocation(IncidentLocationRequest $request): IncidentLocation
    {
        $data = $request->validated();

        if($request->hasFile('landmark')) {
            $data['landmark'] = $request->file('landmark')->store('landmarks','public');
        };
        
        return IncidentLocation::create([
            'zone_id' => $data['zone_id'],
            'location_name' => $data['location_name'],
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'landmark' => $data['landmark']
        ]);
    }

    public function createIncidentReport(array $data): IncidentReport
    {

        return IncidentReport::create([
            'incident_type_id' => $data['incident_type_id'],
            'date' => $data['date'],
            'time' => $data['time'],
            'location_id' => $data['location_id'],
            'report_description' => $data['report_description'],
            'user_id' => $data['user_id']
        ]);
    }

    public function attachEvidence(EvidenceRequest $request, int $reportId): void
    {
        foreach ($request->file('incident_evidence') as $file) {
            $filename = $file->store('evidences', 'public');

            IncidentEvidence::create([
                'report_id' => $reportId,
                'incident_evidence' => $filename,
                'remarks' => $request->input('remarks'),
            ]);
        }
    }

    public function getIncidentReports()
    {
        return IncidentReport::with('incidentType.category','location.zone', 'user', 'evidences',)->get()
                                ->map(function ($report) {                                 
                                if ($report->location && $report->location->landmark) {
                                    $report->location->landmark = asset('storage/' . $report->location->landmark);
                                }
                                $report->evidences->map(function ($evidence) {
                                    $evidence->file_url = asset('storage/' . $evidence->incident_evidence);
                                    return $evidence;
                                });
                                return $report;
                                });
    }

    public function createViolatorsProfile(ViolatorsProfileRequest $request): ViolatorsProfile
    {
        $data = $request->validated();

         if($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('violators','public');
        };

        return ViolatorsProfile::create([
            'last_name' => $data['last_name'],
            'first_name' => $data['first_name'],
            'age' => $data['age'],
            'zone_id' => $data['zone_id'],
            'address' => $data['address'],
            'photo' => $data['photo']
        ]);
    }

    public function attachViolatorsRecord(ViolatorsRecordRequest $request, int $reportId): array
    {
        $records = [];

        if (!empty($request->violator_id)) {
            foreach ($request->violator_id as $violatorId) {
                $records[] = ViolatorsRecord::create([
                    'report_id' => $reportId,
                    'violator_id' => $violatorId,
                ]);
            }
        }

        return $records;
    }

    public function reportViolators(int $id)
    {
        $records = ViolatorsRecord::with('violators.zone')->where('report_id', $id)->get();

        $records->each(function ($record) {
            if ($record->violators && $record->violators->photo) {
                $record->violators->photo = asset('storage/' . $record->violators->photo);
            }
        });

        return $records;
    }

}