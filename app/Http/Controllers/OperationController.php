<?php

namespace App\Http\Controllers;

use App\Models\Operation;
use App\Rules\PolygonGeofence;
use App\Services\OperationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OperationController extends Controller
{
    public function __construct(private OperationService $operations) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status'   => ['nullable', Rule::in(OperationService::OPERATION_STATUSES)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        return response()->json(
            $this->operations->paginateOperations(
                $request->query('status'),
                (int) $request->query('per_page', 15)
            )
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'latitude'  => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'geofence'  => ['nullable', new PolygonGeofence],
            'status'    => ['sometimes', Rule::in(OperationService::OPERATION_STATUSES)],
            'event_date' => ['nullable', 'date'],
            'zone_id' => ['nullable', 'integer', 'exists:zones,id'],
        ]);

        return response()->json($this->operations->createOperation($data), 201);
    }

    public function show(Operation $operation): JsonResponse
    {
        return response()->json($this->operations->getOperation($operation->id));
    }

    public function update(Request $request, Operation $operation): JsonResponse
    {
        $data = $request->validate([
            'name'      => ['sometimes', 'required', 'string', 'max:255'],
            'latitude'  => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'geofence'  => ['nullable', new PolygonGeofence],
            'status'    => ['sometimes', Rule::in(OperationService::OPERATION_STATUSES)],
            'zone_id' => ['nullable', 'integer', 'exists:zones,id'],
        ]);

        return response()->json(
            $this->operations->updateOperation($operation, $data)
        );
    }

    /**
     * Save the drawn geofence: { "geofence": { "type": "Polygon", "coordinates": [[[lng, lat], ...]] } }
     */
    public function updateGeofence(Request $request, Operation $operation): JsonResponse
    {
        $data = $request->validate([
            'geofence' => ['required', new PolygonGeofence],
        ]);

        return response()->json(
            $this->operations->updateOperationGeofence($operation, $data['geofence'])
        );
    }

    public function updateStatus(Request $request, Operation $operation): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(OperationService::OPERATION_STATUSES)],
        ]);

        return response()->json(
            $this->operations->updateOperationStatus($operation, $data['status'])
        );
    }

    public function destroy(Operation $operation): JsonResponse
    {
        $this->operations->deleteOperation($operation);

        return response()->json(null, 204);
    }

    /**
     * All personnel deployed under an operation, across its areas.
     */
    public function personnel(Request $request, Operation $operation): JsonResponse
    {
        $request->validate([
            'status' => ['nullable', Rule::in(OperationService::PERSONNEL_STATUSES)],
        ]);

        return response()->json(
            $this->operations->getOperationPersonnel($operation, $request->query('status'))
        );
    }
}