<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PolygonGeofence implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (is_string($value)) {
            $value = json_decode($value, true);
        }

        $ring = $value['coordinates'][0] ?? null;

        if (! is_array($value) || ($value['type'] ?? null) !== 'Polygon' || ! is_array($ring)) {
            $fail('The :attribute must be a GeoJSON Polygon.');
            return;
        }

        if (count($ring) < 4) {
            $fail('The :attribute polygon needs at least 3 points.');
            return;
        }

        foreach ($ring as $point) {
            if (! is_array($point) || count($point) < 2
                || ! is_numeric($point[0]) || ! is_numeric($point[1])
                || abs($point[0]) > 180 || abs($point[1]) > 90) {
                $fail('The :attribute contains an invalid coordinate. Expected [longitude, latitude].');
                return;
            }
        }
    }
}