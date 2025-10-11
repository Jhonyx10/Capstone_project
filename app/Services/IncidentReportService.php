<?php

namespace App\Services;

use App\Models\IncidentLocation;
use App\Models\IncidentReport;
use App\Models\IncidentEvidence;
use App\Models\ViolatorsProfile;
use App\Models\ViolatorsRecord;
use App\Models\IncidentRequestResponse;
use App\Models\IncidentResponseRecord;
use App\Http\Requests\IncidentReportRequest;
use App\Http\Requests\EvidenceRequest;
use App\Http\Requests\ViolatorsProfileRequest;
use App\Http\Requests\ViolatorsRecordRequest;
use App\Http\Requests\ResponseRequest;


class IncidentReportService
{
    // Your service logic here

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
            if ($request->hasFile('incident_evidence')) {
            foreach ($request->file('incident_evidence') as $file) {
                $filename = $file->store('evidences', 'public');

                IncidentEvidence::create([
                    'report_id' => $reportId,
                    'incident_evidence' => $filename,
                    'remarks' => $request->input('remarks'),
                ]);
            }
        }
    }

    public function attachResponseRecord(array $data, int $reportId): IncidentResponseRecord
    {
        return IncidentResponseRecord::create([
            'request_id'    => $data['request_id'] ?? null,
            'report_id'     => $reportId,
            'distance'      => $data['distance'] ?? null,
            'response_time' => $data['response_time'] ?? null,
        ]);
    }

    public function statusUpdate(int $responseId)
    {
        $request = IncidentRequestResponse::findOrFail($responseId);
        $request->status = 1;
        $request->save();
    }

    public function getIncidentReports()
    {
        return IncidentReport::with('incidentType.category','location.zone', 'user')
                ->orderByDesc('created_at')
                ->get();
    }

    public function reportDetails(int $id)
    {
        $report = IncidentReport::with('incidentType.category','location.zone', 'user', 'evidences', 'responseRecord.request.user')
            ->where('id', $id)
            ->first(); 

        if ($report) {
            if ($report->location && $report->location->landmark) {
                if (!str_starts_with($report->location->landmark, 'http')) {
                    $report->location->landmark = asset('storage/' . $report->location->landmark);
                }
            }

            $report->evidences->map(function ($evidence) {
                $evidence->file_url = asset('storage/' . $evidence->incident_evidence);
                return $evidence;
            });
        }

        return $report;
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

    public function attachViolatorsRecord(array $violatorIds, int $reportId): array
    {
        $records = [];

        foreach ($violatorIds as $violatorId) {
            $records[] = ViolatorsRecord::create([
                'report_id' => $reportId,
                'violator_id' => $violatorId,
            ]);
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

    public function createResponseRequest(array $data): IncidentRequestResponse 
    {
        return IncidentRequestResponse::create([
            'user_id' => $data['user_id'],
            'category_id' => $data['category_id'],
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude']
        ]);
    }

    public function getRequestResponse()
    {
        return IncidentRequestResponse::
            join('incident_categories', 'incident_request_responses.category_id', '=', 'incident_categories.id')
            ->where('incident_request_responses.status', 0)
            ->select('incident_request_responses.*', 'incident_categories.category_name')
            ->get();
    }

    public function getViolators()
    {
        return ViolatorsProfile::with('zone')
                        ->orderByDesc('created_at')
                        ->get()
                        ->map(function ($violator) {
                            $violator->photo = asset('storage/' . $violator->photo);
                            return $violator;
                        });
    }

    
}