<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ZoneService;
use App\Http\Requests\ZoneRequest;

class GeoLocationController extends Controller
{
    //
    protected $zoneService;

    public function __construct(ZoneService $zoneService)
    {   
        $this->zoneService = $zoneService;
    }
    public function addZone(ZoneRequest $request)
    {
        $zoneData = $this->zoneService->addZone($request->validated());

        return response()->json([
            'message' => 'Zone Added!',
            'zoneData' => $zoneData
        ], 201);
    }

    public function getZones()
    {
        $zones = $this->zoneService->getZones();

        return response()->json([
            'message' => 'Zone Fetch Successful',
            'zones' => $zones
        ], 200);
    }
}
