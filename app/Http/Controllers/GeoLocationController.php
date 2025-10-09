<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ZoneService;
use App\Http\Requests\IncidentLocationRequest;


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

       public function addIncidentLocation(IncidentLocationRequest $request)
    {
        $incident_location = $this->zoneService->addLocation($request);

         return response()->json([
            'message' => 'created successfully',
            'incident_location' => $incident_location,
        ], 200);
    }
    
    public function getZones()
    {
        $zones = $this->zoneService->getZones();

        return response()->json([
            'message' => 'Zone Fetch Successful',
            'zones' => $zones
        ], 200);
    }

    public function getLocations()
    {
        $locations = $this->zoneService->getLocations();

        return response()->json([
            'message' => 'Locations Fetch Successful',
            'locations' => $locations
        ], 200);
    }

    public function locationDetails($id)
    {
        $location = $this->zoneService->locationDetails($id);

        return response()->json(['location' => $location]);
    }
}
