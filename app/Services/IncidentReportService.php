<?php

namespace App\Services;

use App\Models\IncidentLocation;
use App\Models\IncidentReport;
use App\Models\IncidentEvidence;
use App\Http\Requests\IncidentLocationRequest;
use App\Http\Requests\IncidentReportRequest;
use App\Http\Requests\EvidenceRequest;


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
        return IncidentReport::with('incidentType.category','location.zone', 'user')->get();
    }

}