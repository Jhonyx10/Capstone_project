<?php

namespace App\Services;
use App\Models\Zone;
use App\Models\IncidentLocation;
use App\Models\IncidentReport;
use App\Http\Requests\IncidentLocationRequest;

class ZoneService
{
    // Your service logic here
    public function addZone(array $data): Zone
    {
        return Zone::create([
            'zone_name' => $data['zone_name'],
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
        ]); 
    }

        public function addLocation(IncidentLocationRequest $request): IncidentLocation
    {
        $data = $request->validated();

        if($request->hasFile('landmark')) {
            $data['landmark'] = $request->file('landmark')->store('landmarks','public');
        };
        
        return IncidentLocation::create([
            'zone_id' => $data['zone_id'],
            'location_name' => $data['location_name'],
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'landmark' => $data['landmark']
        ]);
    }

    public function getZones()
    {
        return Zone::get();
    }

    public function getIncidentLocations()
    {
        return IncidentReport::with('location')->get();
    }

    public function getLocations()
    {
        return IncidentLocation::with('reports.incidentType')->get()
            ->map(function ($location) {
                if ($location->landmark) {
                    if (!str_starts_with($location->landmark, 'http')) {
                        $location->landmark = asset('storage/' . $location->landmark);
                    }
                }
                return $location;
            });
    }

}