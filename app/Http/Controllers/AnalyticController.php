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

    public function totalRequest()
    {
        $request = $this->analyticsService->totalRequest();

        return response()->json(['total_request' => $request]);
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

    public function totalViolatorsPerZone()
    {
        $zone_violators = $this->analyticsService->totalViolatorsByZone();

        return response()->json(['zone_violators' => $zone_violators]);
    }

    public function analytics()
    {
        //total incident reports by categories.
        $category_reports = $this->analyticsService->getReportsByCategory();
        //total incident reports by zones.
        $zones = $this->analyticsService->incidentPerZones();
        //incident occurrence of current and previous month by category.
        $categoryTrends = $this->analyticsService->compareIncidentCategories();
        //incident report total from current and previous years.
        $reports = $this->analyticsService->yearComparisonAnalytics();
        //average response time for each zones.
        $response_time = $this->analyticsService->zoneAverageResponseTime();
        //monthly recorded violators.
        $violators = $this->analyticsService->monthlyRecordedViolators();
        //total violators for each zones.
        $zone_violators = $this->analyticsService->totalViolatorsByZone();
        //incident trend for the current month from the current and previous year.
        $incident_trend = $this->analyticsService->prevMonthIncidentTrend();
        //incident trend for zone of the current month from the current and previous year.
        $zones_incident_trends = $this->analyticsService->prevMonthZonesIncidentTrend();
        //monthly incident reports.
        $monthly_reports = $this->analyticsService->getMonthlyReports();
        //average response time per categories.
        $responseTimePerCategory = $this->analyticsService->averageResponseTimePerCategory();
        //over all total reports.
        $total_reports = $this->analyticsService->overAllTotalReports();
        //incident peak hours.
        $incident_peak_hours = $this->analyticsService->peakReportingHours();
        $peak_hours = $this->analyticsService->peakHour();
        //least reported category.
        $least_reported_category = $this->analyticsService->leastReportedCategory();
        //most reported category.
        $most_reported_category = $this->analyticsService->mostReportedCategory();

        return response()->json([

            'category_reports' => $category_reports,
            'zones' => $zones,
            'reports' => $reports,
            'response_time' => $response_time,
            'violators' => $violators,
            'zone_violators' => $zone_violators,
            'incident_trend' => $incident_trend,
            'zone_incident_trends' => $zones_incident_trends,
            'monthly_reports' => $monthly_reports,
            'category_response_time' => $responseTimePerCategory,
            'total_reports' => $total_reports,
            'incident_peak_hours' => $incident_peak_hours,
            'peak_hours' => $peak_hours,
            'least_reported_category' => $least_reported_category,
            'most_reported_category' => $most_reported_category
        ]);
    }
}
