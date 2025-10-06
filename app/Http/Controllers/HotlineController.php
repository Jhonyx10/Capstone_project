<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\HotlineRequest;
use App\Services\HotlineService;

class HotlineController extends Controller
{
    protected $hotline;

    public function __construct(HotlineService $hotline)
    {
        $this->hotline = $hotline;
    }

    public function store(HotlineRequest $request)
    {
        $hotline = $this->hotline->store($request->validated());

        return response()->json(['hotline' => $hotline]);
    }

    public function index()
    {
        $hotlines = $this->hotline->index();

        return response()->json(['hotlines' => $hotlines]);
    }

    public function update(Request $request, $id)
    {
        $validate = $request->validate([
            'department_name' => 'string',
            'hotline_number' => 'string'
        ]);
    
        $hotline = $this->hotline->update($validate, $id);

        return response()->json(['hotline' => $hotline]);
    }
}
