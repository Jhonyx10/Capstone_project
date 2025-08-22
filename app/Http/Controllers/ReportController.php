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
use App\Events\CreateViolatorEvent;
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

   public function fileReport(
    IncidentReportRequest $reportRequest,
    EvidenceRequest $evidenceRequest,
    ViolatorsRecordRequest $recordRequest
    )
    {
        try {
            DB::beginTransaction();

            $report = $this->incidentReport->createIncidentReport($reportRequest->validated());

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

        broadcast(new CreateViolatorEvent($violator));
        
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

    public function getRequest()
    {
        $request = $this->incidentReport->getRequestResponse();

        return response()->json([
            'request' => $request,
        ], 201);
    }

    public function getViolators()
    {
        $violators = $this->incidentReport->getViolators();

        return response()->json([
            'violators' => $violators,
        ], 200);
    }
}
