<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Area extends Model
{
    protected $table ='areas';
    
    protected $fillable = [
        'operation_id',
        'name',
        'latitude',
        'longitude',
        'geofence',
        'capacity',
    ];

    protected $casts = [
        'geofence' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
        'capacity' => 'integer',
    ];

    /**
     * The parent operation.
     */
    public function operation(): BelongsTo
    {
        return $this->belongsTo(Operation::class);
    }

    /**
     * Direct access to the personnel assignment records (with deployment status).
     */
    public function areaPersonnel(): HasMany
    {
        return $this->hasMany(AreaPersonnel::class);
    }

    /**
     * Direct relationship to assigned User records (Tanods/Responders).
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'area_personnel')
                    ->withPivot('status')
                    ->withTimestamps();
    }
}
