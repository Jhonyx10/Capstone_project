<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Operation;
use App\Rules\PolygonGeofence;
use App\Services\OperationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function __construct(private OperationService $operations) {}

    public function index(Operation $operation): JsonResponse
    {
        return response()->json($this->operations->getAreasForOperation($operation));
    }

    public function store(Request $request, Operation $operation): JsonResponse
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'latitude'  => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'geofence'  => ['nullable', new PolygonGeofence],
            'capacity'  => ['sometimes', 'integer', 'min:0'],
        ]);

        return response()->json($this->operations->createArea($operation, $data), 201);
    }

    public function show(Area $area): JsonResponse
    {
        return response()->json($area->load(['operation', 'users']));
    }

    public function update(Request $request, Area $area): JsonResponse
    {
        $data = $request->validate([
            'name'      => ['sometimes', 'required', 'string', 'max:255'],
            'latitude'  => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'geofence'  => ['nullable', new PolygonGeofence],
            'capacity'  => ['sometimes', 'integer', 'min:0'],
        ]);

        return response()->json($this->operations->updateArea($area, $data));
    }

    public function destroy(Area $area): JsonResponse
    {
        $this->operations->deleteArea($area);

        return response()->json(null, 204);
    }
}