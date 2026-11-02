<?php

namespace App\Services;

use App\Models\Area;
use App\Models\AreaPersonnel;
use App\Models\Operation;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OperationService
{
    public const PERSONNEL_STATUSES = ['active', 'inactive', 'standby'];
    public const OPERATION_STATUSES = ['active', 'completed', 'suspended', 'upcoming'];

    /** Operation statuses that still accept personnel assignments. */
    public const DEPLOYABLE_OPERATION_STATUSES = ['active', 'upcoming'];

    /* ---------------------------------------------------------------
     |  Operations
     | ------------------------------------------------------------- */

    public function paginateOperations(?string $status = null, int $perPage = 15): LengthAwarePaginator
    {
        return Operation::query()
            ->with('zone:id,zone_name')
            ->withCount('areas')
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage);
    }

    public function getOperation(int $id): Operation
    {
        return Operation::with(['zone:id,zone_name', 'areas.users'])->findOrFail($id);
    }

    public function createOperation(array $data): Operation
    {
        return DB::transaction(function () use ($data) {
            $data = $this->prepareGeofence($data);

            return Operation::create($data)->load(['zone:id,zone_name', 'areas']);
        });
    }

    public function updateOperation(Operation $operation, array $data): Operation
    {
        return DB::transaction(function () use ($operation, $data) {
            $data = $this->prepareGeofence($data);
            $operation->update($data);

            return $operation->refresh()->load(['zone:id,zone_name', 'areas']);
        });
    }

    /**
     * Save the drawn geofence of the whole operation area.
     */
    public function updateOperationGeofence(Operation $operation, array|string $geofence): Operation
    {
        $data = $this->prepareGeofence(['geofence' => $geofence]);

        $operation->update($data);

        return $operation->refresh();
    }

    public function updateOperationStatus(Operation $operation, string $status): Operation
    {
        if (! in_array($status, self::OPERATION_STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => 'Invalid operation status.',
            ]);
        }

        $operation->update(['status' => $status]);

        return $operation;
    }

    public function deleteOperation(Operation $operation): bool
    {
        // Areas and area_personnel are removed via cascade on delete.
        return (bool) $operation->delete();
    }

    /* ---------------------------------------------------------------
     |  Areas
     | ------------------------------------------------------------- */

    public function getAreasForOperation(Operation $operation): Collection
    {
        return $operation->areas()
            ->withCount([
                'areaPersonnel as active_personnel_count' => fn ($q) => $q->where('status', 'active'),
            ])
            ->get();
    }

    public function createArea(Operation $operation, array $data): Area
    {
        $data = $this->prepareGeofence($data);
        $this->assertAreaWithinOperation($operation, $data);

        return $operation->areas()->create($data);
    }

    public function updateArea(Area $area, array $data): Area
    {
        // Don't allow moving an area to another operation through this method.
        unset($data['operation_id']);

        $data = $this->prepareGeofence($data);

        if (isset($data['latitude'], $data['longitude'])) {
            $this->assertAreaWithinOperation($area->operation, $data);
        }

        // Don't allow capacity to drop below current active headcount.
        if (isset($data['capacity'])) {
            $active = $area->areaPersonnel()->where('status', 'active')->count();

            if ((int) $data['capacity'] < $active) {
                throw ValidationException::withMessages([
                    'capacity' => "Capacity cannot be lower than the {$active} currently active personnel.",
                ]);
            }
        }

        $area->update($data);

        return $area->refresh();
    }

    public function deleteArea(Area $area): bool
    {
        return (bool) $area->delete();
    }

    /* ---------------------------------------------------------------
     |  Personnel deployment
     | ------------------------------------------------------------- */

    /**
     * Assign a user to an area. Re-assigning an existing user updates their status.
     */
    public function assignPersonnel(Area $area, int $userId, string $status = 'active'): AreaPersonnel
    {
        $this->assertValidPersonnelStatus($status);

        return DB::transaction(function () use ($area, $userId, $status) {
            // Lock the area row so concurrent assignments can't exceed capacity.
            $area = Area::with('operation')->whereKey($area->id)->lockForUpdate()->firstOrFail();

            if (! in_array($area->operation->status, self::DEPLOYABLE_OPERATION_STATUSES, true)) {
                throw ValidationException::withMessages([
                    'area_id' => 'Personnel can only be assigned to areas of an active or upcoming operation.',
                ]);
            }

            $existing = AreaPersonnel::where('area_id', $area->id)
                ->where('user_id', $userId)
                ->first();

            $assignedElsewhere = AreaPersonnel::where('user_id', $userId)
                ->where('area_id', '!=', $area->id)
                ->whereHas('area', fn ($q) => $q->where('operation_id', $area->operation_id))
                ->exists();

            if ($assignedElsewhere) {
                throw ValidationException::withMessages([
                    'user_id' => 'This person is already assigned to another area in this operation.',
                ]);
            }

            if ($status === 'active') {
                $this->assertHasCapacity($area, $existing);
            }

            if ($existing) {
                $existing->update(['status' => $status]);

                return $existing->refresh();
            }

            return AreaPersonnel::create([
                'area_id' => $area->id,
                'user_id' => $userId,
                'status'  => $status,
            ]);
        });
    }

    /**
     * Assign many users at once. Returns the created/updated assignments.
     *
     * @param  int[]  $userIds
     */
    public function assignMany(Area $area, array $userIds, string $status = 'active'): array
    {
        return DB::transaction(function () use ($area, $userIds, $status) {
            return collect($userIds)
                ->unique()
                ->map(fn ($id) => $this->assignPersonnel($area, (int) $id, $status))
                ->all();
        });
    }

    public function updatePersonnelStatus(Area $area, int $userId, string $status): AreaPersonnel
    {
        $this->assertValidPersonnelStatus($status);

        return $this->assignPersonnel($area, $userId, $status);
    }

    public function removePersonnel(Area $area, int $userId): bool
    {
        return (bool) AreaPersonnel::where('area_id', $area->id)
            ->where('user_id', $userId)
            ->delete();
    }

    /**
     * Move a user from one area to another within a single transaction.
     */
    public function transferPersonnel(Area $from, Area $to, int $userId, string $status = 'active'): AreaPersonnel
    {
        return DB::transaction(function () use ($from, $to, $userId, $status) {
            $this->removePersonnel($from, $userId);

            return $this->assignPersonnel($to, $userId, $status);
        });
    }

    public function getAreaPersonnel(Area $area, ?string $status = null): Collection
    {
        return $area->areaPersonnel()
            ->with('user')
            ->when($status, fn ($q) => $q->where('status', $status))
            ->get();
    }

    public function getOperationPersonnel(Operation $operation, ?string $status = null): Collection
    {
        return $operation->areaPersonnel()
            ->with(['user', 'area'])
            ->when($status, fn ($q) => $q->where('area_personnel.status', $status))
            ->get();
    }

    /* ---------------------------------------------------------------
     |  Geofence helpers
     | ------------------------------------------------------------- */

    /**
     * Normalize the geofence so the model's `array` cast stores it as JSON.
     * Accepts an array or a JSON string (e.g. from a form or GeoJSON payload).
     */
    protected function prepareGeofence(array $data): array
    {
        if (! array_key_exists('geofence', $data) || $data['geofence'] === null) {
            return $data;
        }

        $geofence = $data['geofence'];

        if (is_string($geofence)) {
            $decoded = json_decode($geofence, true);

            if (json_last_error() !== JSON_ERROR_NONE || ! is_array($decoded)) {
                throw ValidationException::withMessages([
                    'geofence' => 'Geofence must be valid JSON.',
                ]);
            }

            $geofence = $decoded;
        }

        if (! is_array($geofence)) {
            throw ValidationException::withMessages([
                'geofence' => 'Geofence must be an array or a JSON string.',
            ]);
        }

        // Pass the array through; the model cast json_encodes it on save.
        $data['geofence'] = $geofence;

        return $data;
    }

    /**
     * Area's center point must fall inside the operation's geofence (if one is drawn).
     */
    protected function assertAreaWithinOperation(Operation $operation, array $data): void
    {
        $ring = $operation->geofence['coordinates'][0] ?? null;

        if (! $ring || ! isset($data['latitude'], $data['longitude'])) {
            return; // no geofence drawn yet, or no point to check
        }

        if (! $this->pointInPolygon((float) $data['longitude'], (float) $data['latitude'], $ring)) {
            throw ValidationException::withMessages([
                'latitude' => 'The area must be located inside the operation geofence.',
            ]);
        }
    }

    /**
     * Ray-casting point-in-polygon. Ring points are [longitude, latitude].
     */
    protected function pointInPolygon(float $x, float $y, array $ring): bool
    {
        $inside = false;

        for ($i = 0, $j = count($ring) - 1; $i < count($ring); $j = $i++) {
            [$xi, $yi] = $ring[$i];
            [$xj, $yj] = $ring[$j];

            if ((($yi > $y) !== ($yj > $y))
                && ($x < ($xj - $xi) * ($y - $yi) / ($yj - $yi) + $xi)) {
                $inside = ! $inside;
            }
        }

        return $inside;
    }

    /* ---------------------------------------------------------------
     |  Guards
     | ------------------------------------------------------------- */

    protected function assertValidPersonnelStatus(string $status): void
    {
        if (! in_array($status, self::PERSONNEL_STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => 'Status must be one of: ' . implode(', ', self::PERSONNEL_STATUSES) . '.',
            ]);
        }
    }

    /**
     * Capacity 0 is the column default, so it is treated as "no limit set".
     * An existing active assignment doesn't count against itself.
     */
    protected function assertHasCapacity(Area $area, ?AreaPersonnel $existing = null): void
    {
        if ($area->capacity <= 0) {
            return;
        }

        if ($existing && $existing->status === 'active') {
            return;
        }

        $active = AreaPersonnel::where('area_id', $area->id)
            ->where('status', 'active')
            ->count();

        if ($active >= $area->capacity) {
            throw ValidationException::withMessages([
                'area_id' => "Area \"{$area->name}\" is at full capacity ({$area->capacity}).",
            ]);
        }
    }
}