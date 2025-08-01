<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\IncidentLocationRequest;
use App\Http\Requests\IncidentReportRequest;
use App\Http\Requests\EvidenceRequest;
use App\Services\IncidentReportService;
use Illuminate\Support\Facades\DB;
use Exception;

class ReportController extends Controller
{
    //
    protected $incidentReport;

    public function __construct(IncidentReportService $incidentReport)
    {
        $this->incidentReport = $incidentReport;
    }

    public function addIncidentLocation(IncidentLocationRequest $request)
    {
        $incident_location = $this->incidentReport->addLocation($request);

         return response()->json([
            'message' => 'created successfully',
            'incident_location' => $incident_location,
        ], 200);
    }

   public function fileReport(
    IncidentLocationRequest $locationRequest,
    IncidentReportRequest $reportRequest,
    EvidenceRequest $evidenceRequest
    )
    {
        try {
            DB::beginTransaction();

            $location = $this->incidentReport->addLocation($locationRequest);

            $reportData = $reportRequest->validated();
            $reportData['location_id'] = $location->id;

            $report = $this->incidentReport->createIncidentReport($reportData);

            $evidence = $evidenceRequest->validated();

            $reportEvidence = $this->incidentReport->attachEvidence($evidenceRequest, $report->id);

            DB::commit();

            return response()->json([
                'message' => 'Report successfully created.',
                'report' => $report,
                'location' => $location
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to file report.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getIncidentReports()
    {
        $reports = $this->incidentReport->getIncidentReports();

        return response()->json([
            'message' => 'fetch successful',
            'reports' => $reports
        ], 200);
    }
}
