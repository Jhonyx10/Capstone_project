<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SightingReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'subject_id' => $this->subject_id,
            'location'   => $this->location,
            'latitude'   => $this->latitude,
            'longitude'  => $this->longitude,
            'note'       => $this->note,
            'subject'    => $this->whenLoaded('subject', fn () => $this->subject ? [
                'id'         => $this->subject->id,
                'type'       => $this->subject->type,
                'identifier' => $this->subject->identifier,
                'image_url'  => $this->subject->image_url,
                'status'     => $this->subject->status,
            ] : null),
            'reporter'   => $this->whenLoaded('reporter', fn () => $this->reporter ? [
                'id'   => $this->reporter->id,
                'name' => $this->reporter->name,
            ] : null),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}