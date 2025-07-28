<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    use HasFactory;

    protected $table = 'zones';

    protected $fillable = ['zone_name', 'latitude', 'longitude'];

    public function locations()
    {
        return $this->hasMany(IncidentLocation::class, 'location_id');
    }
}
