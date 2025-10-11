<?php

namespace App\Services;

use App\Models\User;
use App\Models\IncidentReport;
use App\Models\ViolatorsRecord;
use App\Models\ViolatorsProfile;
use App\Models\IncidentRequestResponse;
use App\Models\Zone;
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

    public function yearComparisonAnalytics()
    {
        $currentYear = Carbon::now()->year;
        $previousYear = Carbon::now()->subYear()->year;

        $reports = IncidentReport::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as total')
            ->whereYear('created_at', $currentYear)
            ->orWhereYear('created_at', $previousYear)
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return $reports;
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
        $totalReports = IncidentReport::count();

        $categoryStats = IncidentReport::select(
                'incident_categories.category_name as category',
                \DB::raw('COUNT(incident_reports.id) as count')
            )
            ->join('incident_types', 'incident_reports.incident_type_id', '=', 'incident_types.id')
            ->join('incident_categories', 'incident_types.category_id', '=', 'incident_categories.id')
            ->groupBy('incident_categories.category_name')
            ->get()
            ->map(function ($item) use ($totalReports) {
                $item->percentage = $totalReports > 0 
                    ? round(($item->count / $totalReports) * 100, 2) 
                    : 0;
                return $item;
            });

        return $categoryStats;
    }

    /**
     * Get monthly report counts for the current year.
     *
     * @return array
     */
    // this data will be displayed in a graph
    public function getMonthlyReports()
    {
       $currentYear = Carbon::now()->year;

        $months = [];
        $previousMonthCount = null; 
        
        for ($month = 1; $month <= 12; $month++) {
            $currentMonthCount = IncidentReport::whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $month) 
                ->count();

            $momChange = null;
            if (!is_null($previousMonthCount)) {
                $momChange = $previousMonthCount > 0
                    ? round((($currentMonthCount - $previousMonthCount) / $previousMonthCount) * 100, 2)
                    : null;
            }

            $months[] = [
                'month' => Carbon::createFromDate($currentYear, $month, 1)->format('M'),
                'report_count' => $currentMonthCount,
                'mom_change' => $momChange !== null ? round($momChange, 2) : null
            ];

            $previousMonthCount = $currentMonthCount;
        }

        return $months;
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

    public function monthlyRecordedViolators()
    {
        return ViolatorsProfile::selectRaw('MONTH(created_at) as month, count(*) as total')
                                 ->whereYear('created_at', Carbon::now()->year)
                                 ->groupBy('month')
                                 ->orderBy('month')
                                 ->get();
    }

    public function totalViolatorsByZone()
    {
        return ViolatorsProfile::selectRaw('count(*) as total, zones.zone_name as zone_name')
                                ->join('zones', 'zones.id', '=', 'violators_profiles.zone_id')
                                 ->whereYear('violators_profiles.created_at', Carbon::now()->year)
                                 ->groupBy('zone_name')
                                 ->get();
    }

    //average response time by zone idm displayed in the zone details.
    public function averageResponseTimeByZone(int $id)
    {
        return IncidentResponseRecord::whereHas('report.location.zone', function ($query) use ($id) {
            $query->where('id', $id);
        })
        ->with(['report.location.zone:id,zone_name'])
        ->selectRaw('AVG(response_time) as avg_response_time')
        ->first();
    }

    public function zoneAverageResponseTime()
    {
        return IncidentResponseRecord::selectRaw('zones.id, zones.zone_name, AVG(incident_response_records.response_time) as average_zone_response, COUNT(DISTINCT incident_response_records.report_id) as reports')
            ->join('incident_reports', 'incident_reports.id', '=', 'incident_response_records.report_id')
            ->join('incident_locations', 'incident_locations.id', '=', 'incident_reports.location_id')
            ->join('zones', 'zones.id', '=', 'incident_locations.zone_id')
            ->groupBy('zones.id', 'zones.zone_name')
            ->get();
    }

    public function overAllTotalReports()
    {
        return IncidentReport::count();
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

    public function incidentPerZones()
    {
         $totalReports = IncidentReport::count();

        return IncidentReport::select(
                'zones.id as zone_id',
                'zones.zone_name as zone_name',
                \DB::raw('COUNT(*) as total_incidents')
            )
            ->join('incident_locations', 'incident_reports.location_id', '=', 'incident_locations.id')
            ->join('zones', 'incident_locations.zone_id', '=', 'zones.id')
            ->groupBy('zones.id', 'zones.zone_name')
            ->orderByDesc('total_incidents')
            ->get()
            ->map(function ($item) use ($totalReports) {
                $item->percentage = $totalReports > 0 
                    ? round(($item->total_incidents / $totalReports) * 100, 2) 
                    : 0;
                return $item;
            });
    }

    //comparison of incident occurrence of current and previous month by categories.
    public function compareIncidentCategories()
    {
        $currentMonth = Carbon::now()->month;
        $previousMonth = Carbon::now()->subMonth()->month;

        $year = Carbon::now()->year;

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

    public function currentPreviousTotalReports()
    {
        $currentMonth = Carbon::now()->month;
        $previousMonth = Carbon::now()->subMonth()->month;
        $year = Carbon::now()->year;

        $current = IncidentReport::selectRaw('COUNT(*) as total')
            ->whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $year);

        $previous = IncidentReport::selectRaw('COUNT(*) as total')
            ->whereMonth('created_at', $previousMonth)
            ->whereYear('created_at', $year);

        return DB::table(DB::raw("({$current->toSql()}) as current"))
            ->mergeBindings($current->getQuery())
            ->leftJoin(DB::raw("({$previous->toSql()}) as previous"), DB::raw("1"), "=", DB::raw("1"))
            ->mergeBindings($previous->getQuery())
            ->selectRaw('
                current.total as current_total,
                COALESCE(previous.total, 0) as previous_total,
                ((current.total - COALESCE(previous.total, 0)) / NULLIF(previous.total, 0)) * 100 as percent_change
            ')
            ->first();
    }

        //total average response time.
    public function averageResponseTime()
    {
        $currentMonth = Carbon::now()->month;
        $previousMonth = Carbon::now()->subMonth()->month;
        $year = Carbon::now()->year;

        $current = IncidentResponseRecord::selectRaw('AVG(response_time) as cur_response_time')
            ->whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $year);

        $previous = IncidentResponseRecord::selectRaw('AVG(response_time) as prev_response_time')
            ->whereMonth('created_at', $previousMonth)
            ->whereYear('created_at', $year);

        return DB::table(DB::raw("({$current->toSql()}) as current"))
            ->mergeBindings($current->getQuery())
            ->leftJoin(DB::raw("({$previous->toSql()}) as previous"), DB::raw("1"), "=", DB::raw("1"))
            ->mergeBindings($previous->getQuery())
            ->selectRaw(
                'current.cur_response_time as current_response,
                COALESCE(previous.prev_response_time, 0) as previous_response,
                ((current.cur_response_time - COALESCE(previous.prev_response_time, 0)) / NULLIF(previous.prev_response_time, 0)) * 100 as percent_change'
            )
            ->first();
    }

    public function totalRequest()
    {
        $currentMonth = Carbon::now()->month;
        $previousMonth = Carbon::now()->subMonth()->month;
        $year = Carbon::now()->year;

         $cur = IncidentRequestResponse::selectRaw('COUNT(*) as cnt')
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $year);
        
        $prev = IncidentRequestResponse::selectRaw('COUNT(*) as cnt')
                ->whereMonth('created_at', $previousMonth)
                ->whereYear('created_at', $year);
        
         return DB::table(DB::raw("({$cur->toSql()}) as cur"))
            ->mergeBindings($cur->getQuery())
            ->leftJoin(DB::raw("({$prev->toSql()}) as prev"), DB::raw("1"), "=", DB::raw("1"))
            ->mergeBindings($prev->getQuery())
            ->selectRaw(
                'cur.cnt as current_month_total, 
                COALESCE(prev.cnt, 0) as previous_month_total,
                ((cur.cnt - COALESCE(prev.cnt, 0)) / NULLIF(prev.cnt, 0)) * 100 as monthly_request'
            )
            ->first();
    }

    public function registeredUsers()
    {
        $currentMonth = Carbon::now()->month;
        $previousMonth = Carbon::now()->subMonth()->month;
        $year = Carbon::now()->year;

        $cur = User::selectRaw('COUNT(*) as cnt')
                ->where('role', '=', 'resident')
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $year);

        $prev = User::selectRaw('COUNT(*) as cnt')
                    ->where('role', '=', 'resident')
                    ->whereMonth('created_at', $previousMonth)
                    ->whereYear('created_at', $year);

        return DB::table(DB::raw("({$cur->toSql()}) as cur"))
            ->mergeBindings($cur->getQuery())
            ->leftJoin(DB::raw("({$prev->toSql()}) as prev"), DB::raw("1"), "=", DB::raw("1"))
            ->mergeBindings($prev->getQuery())
            ->selectRaw(
                'cur.cnt as current_month_registered, 
                COALESCE(prev.cnt, 0) as previous_month_registered,
                ((cur.cnt - COALESCE(prev.cnt, 0)) / NULLIF(prev.cnt, 0)) * 100 as monthly_registered'
            )
            ->first();
    }

    public function prevMonthIncidentTrend()
    {
        $currMonth = Carbon::now()->month;
        $prevMonth = Carbon::now()->subMonth()->month;
        $year = Carbon::now()->year;

        return IncidentReport::selectRaw('
                incident_categories.id as category_id,
                incident_categories.category_name as category,
                MONTH(incident_reports.created_at) as month,
                MONTHNAME(incident_reports.created_at) as month_name,
                COUNT(*) as total
            ')
            ->join('incident_types', 'incident_types.id', '=', 'incident_reports.incident_type_id')
            ->join('incident_categories', 'incident_categories.id', '=', 'incident_types.category_id')
            ->whereYear('incident_reports.created_at', $year)
            ->whereIn(DB::raw('MONTH(incident_reports.created_at)'), [$currMonth, $prevMonth])
            ->groupBy('incident_categories.id', 'incident_categories.category_name', DB::raw('MONTH(incident_reports.created_at)'), DB::raw('MONTHNAME(incident_reports.created_at)'))
            ->orderBy('incident_categories.id')
            ->get();
    }

    public function prevMonthZonesIncidentTrend()
    {
        $currMonth = Carbon::now()->month;
        $prevMonth = Carbon::now()->subMonth()->month;
        $year = Carbon::now()->year;

        return IncidentReport::selectRaw('
                zones.id as zone_id,
                zones.zone_name as zone_name,
                MONTH(incident_reports.created_at) as year,
                MONTHNAME(incident_reports.created_at) as month_name,
                COUNT(*) as total
            ')
            ->join('incident_locations', 'incident_locations.id', '=', 'incident_reports.location_id')
            ->join('zones', 'zones.id', '=', 'incident_locations.zone_id')
            ->whereYear('incident_reports.created_at', $year)
            ->whereIn(DB::raw('MONTH(incident_reports.created_at)'), [$currMonth, $prevMonth])
            ->groupBy('zones.id', 'zones.zone_name', DB::raw('MONTH(incident_reports.created_at)'), DB::raw('MONTHNAME(incident_reports.created_at)'))
            ->orderBy('zones.id')
            ->get();
    }

    public function peakReportingHours()
    {
        return IncidentReport::select(
                DB::raw('HOUR(time) as hour'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy(DB::raw('HOUR(time)'))
            ->orderBy('hour')
            ->get();
    }

    public function peakHour()
    {
        return IncidentReport::select(DB::raw('HOUR(time) as hour'), DB::raw('COUNT(*) as total'))
            ->groupBy('hour')
            ->orderByDesc('total')
            ->limit(1)
            ->first();
    }

    public function leastReportedCategory()
    {
        return IncidentReport::select(
                'incident_categories.category_name as category',
                DB::raw('COUNT(incident_reports.id) as total')
            )
            ->join('incident_types', 'incident_reports.incident_type_id', '=', 'incident_types.id')
            ->join('incident_categories', 'incident_types.category_id', '=', 'incident_categories.id')
            ->groupBy('category')
            ->orderBy('total', 'asc')
            ->first(); 
    }

    public function mostReportedCategory()
    {
        return IncidentReport::select(
                'incident_categories.category_name as category',
                DB::raw('COUNT(incident_reports.id) as total')
            )
            ->join('incident_types', 'incident_reports.incident_type_id', '=', 'incident_types.id')
            ->join('incident_categories', 'incident_types.category_id', '=', 'incident_categories.id')
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->first(); 
    }
}
