<?php

namespace App\Services;

use App\Models\IncidentLocation;
use App\Http\Requests\IncidentLocationRequest;

class IncidentReportService
{
    // Your service logic here
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
}