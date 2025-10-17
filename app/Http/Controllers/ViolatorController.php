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

    public function blockUser($id)
    {
        $user - $this->violator->blockUser($id);

        return response()->json($user);
    }
}
