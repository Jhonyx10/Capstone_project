<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Operation extends Model
{
    protected $table = 'operations';
    
    protected $fillable = [
        'name',
        'latitude',
        'longitude',
        'geofence',
        'status',
        'event_date',
        'zone_id',
    ];

    /**
     * Cast JSON geofence to an array automatically.
     */
    protected $casts = [
        'geofence' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
        'event_date' => 'date:Y-m-d'
    ];

    /**
     * An operation has many target areas/posts.
     */
    public function areas(): HasMany
    {
        return $this->hasMany(Area::class);
    }

    /**
     * Get all personnel deployed under this operation across all areas.
     */
    public function areaPersonnel(): HasManyThrough
    {
        return $this->hasManyThrough(AreaPersonnel::class, Area::class);
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }
}
