<?php

namespace App\Services\Concerns;

use App\Models\IncidentReport;
use App\Models\IncidentRequestResponse;
use App\Models\IncidentResponseRecord;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;

/**
 * Home-screen analytics for the logged-in tanod, scoped to the tanod's group.
 *
 * Apply inside AnalyticService with:  use TanodAnalytics;
 *
 * How "the group's work" is worked out from your models:
 *  - Group members   : users in group_user with ended_at = null (current members).
 *  - Group's reports : incident_reports.user_id is the tanod who filed it.
 *  - Response time   : incident_response_records has no user, so its report's
 *                      user_id says which tanod it belongs to.
 *  - Group's requests: incident_request_responses.user_id is the RESIDENT who
 *                      asked for help, so a request counts for the group when
 *                      its response record's report was filed by a member.
 */
trait TanodAnalytics
{
    /**
     * One payload for the tanod home screen. The keys inside each block match
     * the ones the mobile HomeScreen already reads.
     */
    public function tanodHomeAnalytics(User $user): array
    {
        $memberIds = $this->groupMemberIds($user);

        return [
            'reports'       => $this->groupReportComparison($memberIds),
            'response_time' => $this->groupAverageResponseTime($memberIds),
            'requests'      => $this->groupRequestComparison($memberIds),
            // residents are not tied to a group, so this stays barangay-wide
            'residents'     => (array) $this->registeredUsers(),

            // extra insights for the home screen
            'weekly_trend'     => $this->groupWeeklyTrend($memberIds),
            'top_categories'   => $this->groupTopCategories($memberIds),
            'busiest_hour'     => $this->groupBusiestHour($memberIds),
            'response_summary' => $this->groupResponseSummary($memberIds),
            'pending_requests' => $this->pendingRequests(),
            'leaderboard'      => $this->groupLeaderboard($memberIds, $user),
            'recent_reports'   => $this->groupRecentReports($memberIds),
        ];
    }

    /**
     * Ids of everyone currently in the user's group. When the user is not in a
     * group, it is just the user.
     */
    private function groupMemberIds(User $user): array
    {
        $group = $user->groups()->wherePivotNull('ended_at')->first();

        if (!$group) {
            return [$user->id];
        }

        return $group->users()->pluck('users.id')->all();
    }

    /** This month and last month, as [start, end] pairs. */
    private function monthRanges(): array
    {
        $now  = Carbon::now();
        $prev = $now->copy()->subMonthNoOverflow();

        return [
            'current'  => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
            'previous' => [$prev->copy()->startOfMonth(), $prev->copy()->endOfMonth()],
        ];
    }

    /** Percent change, or null when there is no previous value to compare. */
    private function percentChange(float|int $current, float|int $previous): ?float
    {
        return $previous > 0
            ? round((($current - $previous) / $previous) * 100, 2)
            : null;
    }

    /** Reports filed by the group. Feeds the bar chart: last month vs this month. */
    public function groupReportComparison(array $memberIds): array
    {
        $ranges = $this->monthRanges();

        $count = fn (array $range) => IncidentReport::whereIn('user_id', $memberIds)
            ->whereBetween('created_at', $range)
            ->count();

        $current  = $count($ranges['current']);
        $previous = $count($ranges['previous']);

        return [
            'current_total'  => $current,
            'previous_total' => $previous,
            'percent_change' => $this->percentChange($current, $previous),
        ];
    }

    /** Average response time of the group's responses, this month vs last. */
    public function groupAverageResponseTime(array $memberIds): array
    {
        $ranges = $this->monthRanges();

        $avg = fn (array $range) => (float) IncidentResponseRecord::whereHas(
                'report',
                fn ($q) => $q->whereIn('user_id', $memberIds)
            )
            ->whereBetween('created_at', $range)
            ->avg('response_time');

        $current  = $avg($ranges['current']);
        $previous = $avg($ranges['previous']);

        return [
            'current_response'  => round($current, 2),
            'previous_response' => round($previous, 2),
            'percent_change'    => $this->percentChange($current, $previous),
        ];
    }

    /** Resident requests the group responded to, this month vs last. */
    public function groupRequestComparison(array $memberIds): array
    {
        $ranges = $this->monthRanges();

        $count = fn (array $range) => IncidentRequestResponse::whereHas(
                'responseRecord.report',
                fn ($q) => $q->whereIn('user_id', $memberIds)
            )
            ->whereBetween('created_at', $range)
            ->count();

        $current  = $count($ranges['current']);
        $previous = $count($ranges['previous']);

        return [
            'current_month_total'  => $current,
            'previous_month_total' => $previous,
            'monthly_request'      => $this->percentChange($current, $previous),
        ];
    }

    /** Reports filed by the group on each of the last 7 days (zeros included). */
    public function groupWeeklyTrend(array $memberIds): array
    {
        $start = Carbon::now()->subDays(6)->startOfDay();

        $counts = IncidentReport::whereIn('user_id', $memberIds)
            ->where('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $labels = [];
        $data   = [];
        for ($i = 0; $i < 7; $i++) {
            $day      = $start->copy()->addDays($i);
            $labels[] = $day->format('D');
            $data[]   = (int) ($counts[$day->toDateString()] ?? 0);
        }

        return ['labels' => $labels, 'data' => $data];
    }

    /** The group's five most reported categories this month. */
    public function groupTopCategories(array $memberIds): array
    {
        $range = $this->monthRanges()['current'];

        $total = IncidentReport::whereIn('user_id', $memberIds)
            ->whereBetween('created_at', $range)
            ->count();

        return IncidentReport::whereIn('incident_reports.user_id', $memberIds)
            ->whereBetween('incident_reports.created_at', $range)
            ->join('incident_types', 'incident_types.id', '=', 'incident_reports.incident_type_id')
            ->join('incident_categories', 'incident_categories.id', '=', 'incident_types.category_id')
            ->selectRaw('incident_categories.category_name as category, COUNT(*) as total')
            ->groupBy('incident_categories.id', 'incident_categories.category_name')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'category'   => $row->category,
                'total'      => (int) $row->total,
                'percentage' => $total > 0 ? round(($row->total / $total) * 100, 1) : 0,
            ])
            ->all();
    }

    /** The hour of day the group files the most reports (last 90 days). */
    public function groupBusiestHour(array $memberIds): ?array
    {
        $row = IncidentReport::whereIn('user_id', $memberIds)
            ->where('created_at', '>=', Carbon::now()->subDays(90))
            ->whereNotNull('time')
            ->selectRaw('HOUR(time) as hour, COUNT(*) as total')
            ->groupBy('hour')
            ->orderByDesc('total')
            ->first();

        if (!$row) {
            return null;
        }

        return [
            'hour'  => (int) $row->hour,
            'total' => (int) $row->total,
            'label' => Carbon::createFromTime((int) $row->hour)->format('g A'),
        ];
    }

    /** This month's responses by the group: count, fastest, slowest, avg distance. */
    public function groupResponseSummary(array $memberIds): array
    {
        $range = $this->monthRanges()['current'];

        $query = IncidentResponseRecord::whereHas(
                'report',
                fn ($q) => $q->whereIn('user_id', $memberIds)
            )
            ->whereBetween('created_at', $range);

        $responses = (clone $query)->count();

        return [
            'responses'        => $responses,
            'fastest'          => $responses ? round((float) (clone $query)->min('response_time'), 2) : null,
            'slowest'          => $responses ? round((float) (clone $query)->max('response_time'), 2) : null,
            'average_distance' => $responses ? round((float) (clone $query)->avg('distance'), 2) : null,
        ];
    }

    /**
     * Resident requests from the last 24 hours that nobody has answered yet.
     * Barangay-wide on purpose: any tanod can pick one up.
     */
    public function pendingRequests(): array
    {
        $query = IncidentRequestResponse::whereDoesntHave('responseRecord')
            ->where('created_at', '>=', Carbon::now()->subDay());

        $oldest = (clone $query)->min('created_at');

        return [
            'count'          => (clone $query)->count(),
            'oldest_minutes' => $oldest ? Carbon::parse($oldest)->diffInMinutes(Carbon::now()) : null,
        ];
    }

    /** Reports filed this month by each member of the group, most first. */
    public function groupLeaderboard(array $memberIds, User $me): array
    {
        $range = $this->monthRanges()['current'];

        return User::whereIn('id', $memberIds)
            ->withCount(['reports as reports_count' => fn ($q) => $q->whereBetween('created_at', $range)])
            ->get()
            ->sortByDesc('reports_count')
            ->values()
            ->map(fn ($u) => [
                'user_id' => $u->id,
                'name'    => $u->name,
                'reports' => (int) $u->reports_count,
                'is_me'   => $u->id === $me->id,
            ])
            ->all();
    }

    /** The group's five latest reports. */
    public function groupRecentReports(array $memberIds): array
    {
        return IncidentReport::with(['incidentType.category', 'location.zone'])
            ->whereIn('user_id', $memberIds)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'id'          => $r->id,
                'description' => Str::limit((string) $r->report_description, 80),
                'category'    => $r->incidentType?->category?->category_name,
                'zone'        => $r->location?->zone?->zone_name,
                'created_at'  => $r->created_at?->toIso8601String(),
            ])
            ->all();
    }
}