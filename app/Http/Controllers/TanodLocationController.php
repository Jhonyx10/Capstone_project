<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\TanodLocationUpdated;
use App\Models\TanodLocation;
use App\Models\IncidentRequestResponse;

class TanodLocationController extends Controller
{
        public function update(Request $request)
    {
        \Log::info('📍 Mobile request received', $request->all());
        \Log::info('📱 MOBILE DATA:', $request->all());

        $request->validate([
            'request_id' => 'required|integer',
            'tanod_id'   => 'required|integer',
            'latitude'   => 'required|numeric',
            'longitude'  => 'required|numeric',
        ]);

        TanodLocation::updateOrCreate(
            ['request_id' => $request->request_id],
            [
                'tanod_id'  => $request->tanod_id,
                'latitude'  => $request->latitude,
                'longitude' => $request->longitude,
            ]
        );

        event(new TanodLocationUpdated(
                $request->request_id,
                $request->tanod_id,
                $request->latitude,
                $request->longitude
            ));


        return response()->json([
            'success' => true,
            'message' => 'Location updated and broadcasted',
        ]);
    }

    public function userRequest($id)
    {
        $request = IncidentRequestResponse::where('status', 0)
                ->where('user_id', $id)
                ->latest()
                ->first();

        return response()->json([
            'request' => $request
        ]);
    }
}
