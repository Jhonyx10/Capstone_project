<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Services\OperationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AreaPersonnelController extends Controller
{
    public function __construct(private OperationService $operations) {}

    public function index(Request $request, Area $area): JsonResponse
    {
        $request->validate([
            'status' => ['nullable', Rule::in(OperationService::PERSONNEL_STATUSES)],
        ]);

        return response()->json(
            $this->operations->getAreaPersonnel($area, $request->query('status'))
        );
    }

    /**
     * Assign one user: { "user_id": 5, "status": "active" }
     */
    public function store(Request $request, Area $area): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'status'  => ['sometimes', Rule::in(OperationService::PERSONNEL_STATUSES)],
        ]);

        $assignment = $this->operations->assignPersonnel(
            $area,
            $data['user_id'],
            $data['status'] ?? 'active'
        );

        return response()->json($assignment->load('user'), 201);
    }

    /**
     * Assign many users: { "user_ids": [1,2,3], "status": "standby" }
     */
    public function storeMany(Request $request, Area $area): JsonResponse
    {
        $data = $request->validate([
            'user_ids'   => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer', 'distinct', 'exists:users,id'],
            'status'     => ['sometimes', Rule::in(OperationService::PERSONNEL_STATUSES)],
        ]);

        $assignments = $this->operations->assignMany(
            $area,
            $data['user_ids'],
            $data['status'] ?? 'active'
        );

        return response()->json($assignments, 201);
    }

    public function update(Request $request, Area $area, int $userId): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(OperationService::PERSONNEL_STATUSES)],
        ]);

        return response()->json(
            $this->operations->updatePersonnelStatus($area, $userId, $data['status'])
        );
    }

    public function destroy(Area $area, int $userId): JsonResponse
    {
        $removed = $this->operations->removePersonnel($area, $userId);

        return $removed
            ? response()->json(null, 204)
            : response()->json(['message' => 'User is not assigned to this area.'], 404);
    }

    /**
     * Move a user to another area: { "to_area_id": 9, "status": "active" }
     */
    public function transfer(Request $request, Area $area, int $userId): JsonResponse
    {
        $data = $request->validate([
            'to_area_id' => ['required', 'integer', 'exists:areas,id', 'different:' . $area->id],
            'status'     => ['sometimes', Rule::in(OperationService::PERSONNEL_STATUSES)],
        ]);

        $assignment = $this->operations->transferPersonnel(
            $area,
            Area::findOrFail($data['to_area_id']),
            $userId,
            $data['status'] ?? 'active'
        );

        return response()->json($assignment->load('user'));
    }
}