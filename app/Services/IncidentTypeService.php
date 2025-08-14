<?php

namespace App\Services;

use App\Models\IncidentCategory;
use App\Models\IncidentType;

class IncidentTypeService
{
    // Your service logic here
    public function addCategory(array $data): IncidentCategory
    {
        return IncidentCategory::create([
            'category_name' => $data['category_name']
        ]);
    }

    public function addIncidentType(array $data): IncidentType
    {
        return IncidentType::create([
            'category_id' => $data['category_id'],
            'incident_name' => $data['incident_name']
        ]);
    }

    public function getCategory()
    {
        return IncidentCategory::with('incidentTypes')->get();
    }

    public function getIncidentTypes()
    {
        return IncidentType::get();
    }


}