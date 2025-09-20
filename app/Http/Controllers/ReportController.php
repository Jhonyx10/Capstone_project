<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\IncidentLocationRequest;
use App\Http\Requests\IncidentReportRequest;
use App\Http\Requests\EvidenceRequest;
use App\Http\Requests\ViolatorsProfileRequest;
use App\Http\Requests\ViolatorsRecordRequest;
use App\Http\Requests\ResponseRequest;
use App\Http\Requests\ResponseRecordRequest;
use App\Services\IncidentReportService;
use App\Services\FirebaseService;
use App\Events\RequestResponseEvent;
use App\Events\ReportSubmittedEvent;
use App\Events\CreateViolatorEvent;
use Illuminate\Support\Facades\DB;
use App\Notifications\TestNotification;
use App\Services\NotificationService;
use App\Models\User;
use Exception;

class ReportController extends Controller
{
    //
    protected $incidentReport;
    protected $firebase;

    public function __construct(IncidentReportService $incidentReport, FirebaseService $firebase, NotificationService $notificationService)
    {
        $this->incidentReport = $incidentReport;
        $this->firebase = $firebase;
        $this->notificationService = $notificationService;
    }


public function fileReport(
    IncidentReportRequest $reportRequest,
    EvidenceRequest $evidenceRequest,
    ViolatorsRecordRequest $recordRequest,
    ResponseRecordRequest $responseRequest
)
{
    try {
        DB::beginTransaction();

        $report = $this->incidentReport->createIncidentReport($reportRequest->validated());

        $this->incidentReport->attachEvidence($evidenceRequest, $report->id);

        $violatorsRecord = [];
        $recordData = $recordRequest->validated();
        if (!empty($recordData)) {
            $violatorsRecord = $this->incidentReport->attachViolatorsRecord($recordData, $report->id);
        }

        $response = $responseRequest->validated();
        if (!empty($response) && isset($response['request_id'])) {
            $responseRecord = $this->incidentReport->attachResponseRecord($response, $report->id);
            if (array_key_exists('request_id', $response) && !is_null($response['request_id'])) {
                $this->incidentReport->statusUpdate((int) $response['request_id']);
            }
        }

        DB::commit();

        try {
            broadcast(new ReportSubmittedEvent($report));
            } catch (\Throwable $e) {
                \Log::warning('Broadcast failed', ['e' => $e->getMessage()]);
            }
    //    $firebase = $this->firebase->sendNotificationByRole('admin', 'New Report', 'A report was filed.', ['report_id' => 123]);

        return response()->json([
            'message' => 'Report successfully created.',
            'report' => $report,
            'record' => $violatorsRecord
        ], 201);

    } catch (\Exception $e) {
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

            return response()->json([
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
