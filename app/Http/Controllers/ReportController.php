<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\IncidentLocationRequest;
use App\Http\Requests\IncidentReportRequest;
use App\Http\Requests\EvidenceRequest;
use App\Http\Requests\ViolatorsProfileRequest;
use App\Http\Requests\ViolatorsRecordRequest;
use App\Http\Requests\ChatRequest;
use App\Http\Requests\ResponseRequest;
use App\Http\Requests\ResponseRecordRequest;
use App\Http\Requests\NotificationRequest;
use App\Services\IncidentReportService;
use App\Services\FirebaseService;
use App\Events\RequestResponseEvent;
use App\Events\ReportSubmittedEvent;
use App\Events\CreateViolatorEvent;
use Illuminate\Support\Facades\DB;
use App\Notifications\TestNotification;
use App\Services\NotificationService;
use App\Services\ChatBoxService;
use App\Models\User;
use Exception;

class ReportController extends Controller
{
    //
    protected $incidentReport;
    protected $firebase;
    protected $notificationService;
    protected $chatBox;

    public function __construct(IncidentReportService $incidentReport, FirebaseService $firebase, NotificationService $notificationService, ChatBoxService $chatBox)
    {
        $this->incidentReport = $incidentReport;
        $this->firebase = $firebase;
        $this->notificationService = $notificationService;
        $this->chatBox = $chatBox;
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

        $evidence = [];
       if ($evidenceRequest->hasFile('incident_evidence')) {
            $this->incidentReport->attachEvidence($evidenceRequest, $report->id);
        }
     
        $violatorsRecord = [];
        $recordData = $recordRequest->validated();
        if (!empty($recordData)) {
            $violatorsRecord = $this->incidentReport->attachViolatorsRecord($recordData['violator_id'] ?? [], $report->id);
        }

        $responseData = $responseRequest->validated();
        $responseRecord = null;

        if (!empty($responseData) && !empty($responseData['request_id'])) {
            // Save response record
            $responseRecord = $this->incidentReport->attachResponseRecord($responseData, $report->id);

            // Update request status if request_id is valid
            if (!is_null($responseData['request_id'])) {
                $this->incidentReport->statusUpdate((int) $responseData['request_id']);
            }
        }

        $notification = $this->notificationService->saveReportNotification($report->id);

        DB::commit();

        try {
            broadcast(new ReportSubmittedEvent($report));
            } catch (\Throwable $e) {
                \Log::warning('Broadcast failed', ['e' => $e->getMessage()]);
            }

        return response()->json([
            'message' => 'Report successfully created.',
            'report' => $report,
            'record' => $violatorsRecord,
            'response' => $responseRecord,
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

        $notification = $this->notificationService->saveViolatorsNotification($violator->id);

        broadcast(new CreateViolatorEvent($violator));
        
        return response()->json([
            'message' => 'created successfully.',
            'violator' => $violator,
        ], 201);
    }

    public function reportDetails($id)
    {
        $report_details = $this->incidentReport->reportDetails($id);

        return response()->json(['report_details' => $report_details]);
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

            $chatBox = $this->chatBox->messages($response->id);

            $notification = $this->notificationService->saveRequestNotification($response->id);

            $firebase = $this->firebase->sendFCMNotification(
                                    title: 'Incident Request has been filed.',
                                    body: "A new response was created for request #{$response->id}"
                                );

            broadcast(new RequestResponseEvent($response));
            
            return response()->json([
                'response' => $response,
                'firebase' => $firebase,
            ], 201);
    }

    public function getRequest()
    {
        $requests = $this->incidentReport->getRequestResponse();

        return response()->json([
            'request' => $requests,
        ], 201);
    }

    public function getViolators()
    {
        $violators = $this->incidentReport->getViolators();

        return response()->json([
            'violators' => $violators,
        ], 200);
    }

    public function getTodaysNews()
    {
        $news = $this->incidentReport->getTodaysNews();

        return response()->json([
            'news' => $news,
        ], 200);
    }

    public function rejectRequest($id)
    {
        $status = $this->incidentReport->rejectRequest($id);

        return response()->json($status);
    }

    public function getRequestRecords()
    {
        $records = $this->incidentReport->getRequestRecords();

        return response()->json($records);
    }
}

