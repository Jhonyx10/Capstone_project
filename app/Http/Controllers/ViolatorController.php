<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ViolatorService;

class ViolatorController extends Controller
{
    //
    protected $violator;

    public function __construct(ViolatorService $violator)
    {
        $this->violator = $violator;
    }

    public function getViolatorsDetails($id)
    {
        $violator = $this->violator->getViolatorsDetails($id);

        return response()->json([
            'violator' => $violator
        ], 200);
    }

    public function violatorsRecords($id)
    {
        $records = $this->violator->violatorsRecords($id);

        return response()->json(['records' => $records]);
    }

    public function violatorsViolationCount()
    {
        $violations = $this->violator->violatorsViolationCount();

        return response()->json(['violations' => $violations]);
    }

    public function getResidents()
    {
        $residents = $this->violator->getResidents();

        return response()->json($residents);
    }

    public function residentDetails(int $id, ViolatorService $service)
    {
        return response()->json($service->getResidentDetails($id));
    }

    public function residentPhoto(int $id, ViolatorService $service)
    {
        return $service->residentPhoto($id);
    }

    public function approveResident(Request $request, int $id, ViolatorService $service)
    {
        $service->approveResident($id, $request->user()->id);
        return response()->json(['message' => 'Resident approved.']);
    }

    public function rejectResident(Request $request, int $id, ViolatorService $service)
    {
        $data = $request->validate(['reason' => 'required|string|max:255']);
        $service->rejectResident($id, $request->user()->id, $data['reason']);
        return response()->json(['message' => 'Resident rejected.']);
    }

    public function blockUser($id)
    {
        $user - $this->violator->blockUser($id);

        return response()->json($user);
    }
}
