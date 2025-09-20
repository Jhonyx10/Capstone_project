<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AnalyticService;

class AnalyticController extends Controller
{
    //
    protected $analyticsService;

    public function __construct(AnalyticService $analyticsService) {
        $this->analyticsService = $analyticsService;
    }

    public function totalReports() 
    {
        $total_reports = $this->analyticsService->getTotalReports();

        return response()->json(['total_report' => $total_reports], 200);
    }

    public function recentReports() 
    {
        $recent_reports = $this->analyticsService->getRecentReports();

        return response()->json(['recent_reports' => $recent_reports], 200);
    }

    public function totalReportsByCategory()
    {
        $reports_total = $this->analyticsService->getReportsByCategory();

        return response()->json(['reports_total' => $reports_total]);
    }

    public function monthlyReports()
    {
        $monthly_reports = $this->analyticsService->getMonthlyReports();

        return response()->json(['monthly_reports' => $monthly_reports], 200);
    }

    public function zoneIncidentTotal()
    {
        $total = $this->analyticsService->getIncidentTotalByZones();

        return response()->json(['total' => $total], 200);
    }

    public function ViolatorTotalViolations()
    {
        $violatorsTotal = $this->analyticsService->getViolatorTotalViolations();

        return response()->json(['violatorsTotal' => $violatorsTotal], 200);
    }

    public function averageResponseTime()
    {
        $response_time = $this->analyticsService->averageResponseTime();

        return response()->json(['response_time' => $response_time]);
    }

    public function averageResponseTimeByZone($id)
    {
        $averageResponseTime = $this->analyticsService->averageResponseTimeByZone($id);

        return response()->json(['averageResponseTime' => $averageResponseTime]);
    }

    public function averageResponseTimePerCategory()
    {
        $responseTimePerCategory = $this->analyticsService->averageResponseTimePerCategory();

        return response()->json(['response_category' => $responseTimePerCategory]);
    }

    public function incidentProneZone()
    {
        $zones = $this->analyticsService->incidentProneZones();

        return response()->json(['zones' => $zones]);
    }

    public function compareIncidentCategoriesCurrentPreviousMonth()
    {
        $categoryTrends = $this->analyticsService->compareIncidentCategories();

        return response()->json(['category_trend' => $categoryTrends]);
    }
}
