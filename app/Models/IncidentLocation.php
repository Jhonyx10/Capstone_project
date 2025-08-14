<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncidentLocation extends Model
{
    use HasFactory;

    protected $table = 'incident_locations';

    protected $fillable = ['zone_id', 'location_name', 'latitude', 'longitude', 'landmark'];

    public function zone()
    {
        return $this->belongsTo(Zone::class, 'zone_id');
    }

    public function reports()
    {
        return $this->hasMany(IncidentReport::class, 'location_id');
    }
}
