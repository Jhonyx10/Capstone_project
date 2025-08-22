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
}
