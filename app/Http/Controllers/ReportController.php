<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\IncidentLocationRequest;
use App\Http\Requests\IncidentReportRequest;
use App\Http\Requests\EvidenceRequest;
use App\Http\Requests\ViolatorsProfileRequest;
use App\Http\Requests\ViolatorsRecordRequest;
use App\Http\Requests\ResponseRequest;
use App\Services\IncidentReportService;
use App\Events\RequestResponseEvent;
use App\Events\ReportSubmittedEvent;
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
    EvidenceRequest $evidenceRequest,
    ViolatorsRecordRequest $recordRequest
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

            $recordData = $recordRequest->validated();
            $violatorsRecord = [];
            if (!empty($recordData)) {
                $violatorsRecord = $this->incidentReport->attachViolatorsRecord($recordRequest, $report->id);
            }

            DB::commit();

            broadcast(new ReportSubmittedEvent($report));

            return response()->json([
                'message' => 'Report successfully created.',
                'report' => $report,
                'location' => $location,
                'record' => $violatorsRecord
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

    public function createViolatorsProfile(ViolatorsProfileRequest $request)
    {
        $violator = $this->incidentReport->createViolatorsProfile($request);

        return response()->json([
            'message' => 'created successfully.',
            'violator' => $violator,
        ], 201);
    }

    public function getReportViolators($id)
    {
        $reportViolators = $this->incidentReport->reportViolators($id);

        return response()->json([
            'report_violators' => $reportViolators
        ], 200);
    }

    public function sendRequest(ResponseRequest $responseRequest)
    {
            $response = $this->incidentReport->createResponseRequest($responseRequest->validated());

            broadcast(new RequestResponseEvent($response));

            return response()->json([
                'message' => 'good.',
                'response' => $response
            ], 201);
    }
}
