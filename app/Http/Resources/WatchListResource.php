<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Policies\SightingReportPolicy;

class WatchListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isStaff = $request->user() && SightingReportPolicy::isStaff($request->user());

        return [
            'id'         => $this->id,
            'type'       => $this->type,
            'identifier' => $this->identifier,
            'details'    => $this->details,
            'image_url'  => $this->image_url,
            'status'     => $this->status,

            // Staff-only fields
            $this->mergeWhen($isStaff, [
                'reason'          => $this->reason,
                'sightings_count' => $this->whenCounted('sightings'),
                'latest_sighting' => $this->whenLoaded('latestSighting', fn () => $this->latestSighting
                    ? $this->sightingData($this->latestSighting)
                    : null),
                'sightings'       => $this->whenLoaded('sightings', fn () => $this->sightings
                    ->map(fn ($s) => $this->sightingData($s))
                    ->values()),
                'created_at'      => $this->created_at,
                'updated_at'      => $this->updated_at,
                'deleted_at'      => $this->deleted_at,
            ]),
        ];
    }

    private function sightingData($s): array
    {
        return [
            'id'         => $s->id,
            'location'   => $s->location,
            'latitude'   => $s->latitude,
            'longitude'  => $s->longitude,
            'note'       => $s->note,
            'created_at' => $s->created_at,
        ];
    }
}