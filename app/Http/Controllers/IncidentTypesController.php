<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\CategoryRequest;
use App\Http\Requests\IncidentTypeRequest;
use App\Services\IncidentTypeService;

class IncidentTypesController extends Controller
{
    //
    protected $incidentService;

    public function __construct(IncidentTypeService $incidentService)
    {
        return $this->incidentService = $incidentService;
    }

    public function addCategory(CategoryRequest $request)
    {
        $category = $this->incidentService->addCategory($request->validated());

        return response()->json([
            'message' => 'created successfully',
            'category' => $category,
        ], 200);
    }

    public function addIncidentType(IncidentTypeRequest $request)
    {
        $incident_type = $this->incidentService->addIncidentType($request->validated());

          return response()->json([
            'message' => 'created successfully',
            'incident_type' => $incident_type,
        ], 200);
    }

    public function getIncidentCategories()
    {
        $categories = $this->incidentService->getCategory();

        return response()->json([
            'categories' => $categories
        ], 200);
    }
    
    public function getIncidentTypes()
    {
        $incidentTypes = $this->incidentService->getIncidentTypes();

        return response()->json([
            'incidentTypes' => $incidentTypes
        ], 200);
    }
}
