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

    public function registeredResidents()
    {
        $users = $this->analyticsService->registeredUsers();

        return response()->json(['registered_users' => $users]);
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

    public function currentPreviousChanges()
    {
        $months = $this->analyticsService->currentPreviousTotalReports();

        return response()->json(['months' => $months]);
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

    public function yearReportComparison()
    {
        $reports = $this->analyticsService->yearComparisonAnalytics();

        return response()->json(['reports' => $reports]);
    }

    public function zoneAverageResponseTime()
    {
        $response_time = $this->analyticsService->zoneAverageResponseTime();

        return response()->json(['response_time' => $response_time]);
    }

    public function monthlyRecordedViolators()
    {
        $violators = $this->analyticsService->monthlyRecordedViolators();

        return response()->json(['violators' => $violators]);
    }

    public function totalViolatorsPerZone()
    {
        $zone_violators = $this->analyticsService->totalViolatorsByZone();

        return response()->json(['zone_violators' => $zone_violators]);
    }
}
