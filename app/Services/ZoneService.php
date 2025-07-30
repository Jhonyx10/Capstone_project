<?php

namespace App\Services;
use App\Models\Zone;

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

    public function getZones()
    {
        return Zone::get();
    }
}