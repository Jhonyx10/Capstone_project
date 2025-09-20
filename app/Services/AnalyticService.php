<?php

namespace App\Services;

use App\Models\IncidentReport;
use App\Models\ViolatorsRecord;
use App\Models\ViolatorsProfile;
use App\Models\IncidentResponseRecord;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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
        return IncidentReport::select(
                    'incident_categories.category_name as category',
                    \DB::raw('COUNT(incident_reports.id) as total')
                )
                ->join('incident_types', 'incident_reports.incident_type_id', '=', 'incident_types.id')
                ->join('incident_categories', 'incident_types.category_id', '=', 'incident_categories.id')
                ->groupBy('incident_categories.category_name')
                ->get();
    }

    /**
     * Get monthly report counts for the current year.
     *
     * @return array
     */
    // this data will be displayed in a graph
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

    //total incident per categories group by zones.
    public function getIncidentTotalByZones()
    {
        return IncidentReport::with(['location.zone', 'incidentType.category'])
            ->get()
            ->groupBy(fn($report) => $report->location->zone->id) 
            ->map(function ($zoneReports) {
                $zone = $zoneReports->first()->location->zone;
                $zoneTotal = $zoneReports->count();

                
                $categories = $zoneReports->groupBy(fn($report) => $report->incidentType->category->id)
                    ->map(function ($catReports) {
                        $category = $catReports->first()->incidentType->category;
                        return [
                            'category' => $category,
                            'count' => $catReports->count(),
                        ];
                    })
                    ->values(); 

                return [
                    'zone' => $zone,
                    'zone_total' => $zoneTotal,
                    'categories' => $categories,
                ];
            })
            ->values(); 

    }

    //violators total violations.
    public function getViolatorTotalViolations()
    {
        return ViolatorsProfile::withCount('violationRecords') 
            ->get()
            ->map(function ($violator) {
                return [
                    'violator_id' => $violator->id,
                    'violator_name' => $violator->first_name . ' ' . $violator->last_name,
                    'total_violations' => $violator->violation_records_count, 
                ];
            });

    }

    //total average response time.
    public function averageResponseTime()
    {
       return IncidentResponseRecord::average('response_time');

    }

    //average response time by zone idm displayed in the zone details.
    public function averageResponseTimeByZone(int $id)
    {
       return IncidentResponseRecord::selectRaw('zones.id as zone_id, AVG(incident_response_records.response_time) as avg_response_time')
                                ->join('incident_reports', 'incident_reports.id', '=', 'incident_response_records.report_id')
                                ->join('incident_locations', 'incident_locations.id', '=', 'incident_reports.location_id')
                                ->join('zones', 'zones.id', '=', 'incident_locations.zone_id')
                                ->where('zone_id', $id)
                                ->groupBy('zones.id', 'zones.zone_name')
                                ->first();
    }

    //average response time per incident category
    public function averageResponseTimePerCategory()
    {
        return IncidentResponseRecord::selectRaw('incident_categories.id as category_id, incident_categories.category_name, AVG(incident_response_records.response_time) as avg_response_time, COUNT(DISTINCT incident_response_records.report_id) as reports')
            ->join('incident_reports', 'incident_reports.id', '=', 'incident_response_records.report_id')
            ->join('incident_types', 'incident_types.id', '=', 'incident_reports.incident_type_id')
            ->join('incident_categories', 'incident_categories.id', '=', 'incident_types.category_id')
            ->groupBy('incident_categories.id', 'incident_categories.category_name')
            ->get();
    }

    //top 3 incident prone zones from the previous month.
    public function incidentProneZones()
    {
        return IncidentReport::select('zones.id as zone_id', 'zones.zone_name as zone_name', \DB::raw('COUNT(*) as total_incidents'))
        ->join('incident_locations', 'incident_reports.location_id', '=', 'incident_locations.id')
        ->join('zones', 'incident_locations.zone_id', '=', 'zones.id')
        ->whereBetween('incident_reports.created_at', [now()->subMonth()->startOfMonth(),now()->subMonth()->endOfMonth()])
        ->groupBy('zones.id', 'zones.zone_name')
        ->orderByDesc('total_incidents')
        ->limit(3)
        ->get();
    }

    //comparison of incident occurrence of current and previous month by categories.
    public function compareIncidentCategories()
    {
        $currentMonth = Carbon::now()->month;
        $previousMonth = Carbon::now()->subMonth()->month;

        $year = Carbon::now()->year;
        $prevYear = Carbon::now()->subMonth()->year;

        $current = DB::table('incident_reports')
            ->join('incident_types', 'incident_types.id', '=', 'incident_reports.incident_type_id')
            ->join('incident_categories', 'incident_categories.id', '=', 'incident_types.category_id')
            ->select('incident_categories.id', 'incident_categories.category_name', DB::raw('COUNT(*) as total'))
            ->whereMonth('incident_reports.created_at', $currentMonth)
            ->whereYear('incident_reports.created_at', $year)
            ->groupBy('incident_categories.id', 'incident_categories.category_name');

        $previous = DB::table('incident_reports')
            ->join('incident_types', 'incident_types.id', '=', 'incident_reports.incident_type_id')
            ->join('incident_categories', 'incident_categories.id', '=', 'incident_types.category_id')
            ->select('incident_categories.id', 'incident_categories.category_name', DB::raw('COUNT(*) as total'))
            ->whereMonth('incident_reports.created_at', $previousMonth)
            ->whereYear('incident_reports.created_at', $year)
            ->groupBy('incident_categories.id', 'incident_categories.category_name');

        return DB::table(DB::raw("({$current->toSql()}) as current"))
            ->mergeBindings($current)
            ->leftJoin(DB::raw("({$previous->toSql()}) as previous"), 'current.id', '=', 'previous.id')
            ->mergeBindings($previous)
            ->select(
                'current.id',
                'current.category_name',
                'current.total as current_total',
                DB::raw('COALESCE(previous.total, 0) as previous_total'),
                DB::raw('( (current.total - COALESCE(previous.total, 0)) / NULLIF(previous.total, 0) ) * 100 as percent_change')
            )
            ->get();
    }
}
