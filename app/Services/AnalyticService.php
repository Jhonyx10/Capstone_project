<?php

namespace App\Services;

use App\Models\IncidentReport;
use App\Models\ViolatorsRecord;
use App\Models\ViolatorsProfile;
use Carbon\Carbon;

class AnalyticService
{
    /**
     * Get total number of incident reports.
     *
     * @return int
     */
    public function getTotalReports(): int
    {
        return IncidentReport::count();
    }

    /**
     * Get incident reports created in the last X days.
     *
     * @param int $days
     * @return int
     */
    public function getRecentReports(int $days = 7): int
    {
        return IncidentReport::where('created_at', '>=', Carbon::now()->subDays($days))
                             ->count();
    }

    /**
     * Get reports grouped by category.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getReportsByCategory()
    {
        return IncidentReport::select('category', \DB::raw('count(*) as total'))
                             ->groupBy('category')
                             ->get();
    }

    /**
     * Get monthly report counts for the current year.
     *
     * @return array
     */
    public function getMonthlyReports()
    {
        $reports = IncidentReport::selectRaw('MONTH(created_at) as month, count(*) as total')
                                 ->whereYear('created_at', Carbon::now()->year)
                                 ->groupBy('month')
                                 ->orderBy('month')
                                 ->get();

        // Return an array with month as key and total as value
        $result = [];
        foreach ($reports as $report) {
            $result[$report->month] = $report->total;
        }

        return $result;
    }

    public function getIncidentTotalByZones()
    {
        $reports = IncidentReport::with(['location', 'incidentType'])
            ->get()
            ->groupBy(fn($report) => $report->location->zone) // group by zone
            ->map(function ($zoneReports) {
                $zoneTotal = $zoneReports->count(); // total reports in this zone

                // group by category within the zone
                $categories = $zoneReports->groupBy(fn($report) => $report->incidentType->category)
                    ->map(fn($catReports) => $catReports->count());

                return [
                    'zone_total' => $zoneTotal,
                    'categories' => $categories,
                ];
            });

        return $reports;
    }

    public function getViolatorTotalViolations()
    {
        $violators = ViolatorsProfile::withCount('violationRecords') // count of violators_records per violator
            ->get()
            ->map(function ($violator) {
                return [
                    'violator_id' => $violator->id,
                    'violator_name' => $violator->first_name . ' ' . $violator->last_name,
                    'total_violations' => $violator->violation_records_count, // comes from withCount
                ];
            });

        return $violators;
    }
}
