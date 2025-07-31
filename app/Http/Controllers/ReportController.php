<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\IncidentLocationRequest;
use App\Services\IncidentReportService;

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

}
