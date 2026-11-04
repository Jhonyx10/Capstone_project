<?php

namespace App\Services;

use App\Models\SightingReport;
use Illuminate\Database\Eloquent\Builder;

class SightingReportService
{
    private const RELATIONS = ['subject', 'reporter:id,name'];

    /** Filterable list query: subject_id, reporter_id, from, to. */
    public function query(array $filters = []): Builder
    {
        return SightingReport::query()
            ->with(self::RELATIONS)
            ->when($filters['subject_id'] ?? null, fn ($q, $v) => $q->where('subject_id', $v))
            ->when($filters['reporter_id'] ?? null, fn ($q, $v) => $q->where('reporter_id', $v))
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->latest();
    }

    public function create(array $data, int $reporterId): SightingReport
    {
        $sighting = SightingReport::create([...$data, 'reporter_id' => $reporterId]);

        return $sighting->load(self::RELATIONS);
    }

    public function update(SightingReport $sighting, array $data): SightingReport
    {
        $sighting->update($data);

        return $sighting->refresh()->load(self::RELATIONS);
    }

    public function delete(SightingReport $sighting): void
    {
        $sighting->delete(); // the table has no soft deletes, so this is permanent
    }
}