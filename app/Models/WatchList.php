<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class WatchList extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'watch_lists';

    // Allowed values, matching the enum columns in the migration
    public const TYPE_PERSON  = 'person';
    public const TYPE_VEHICLE = 'vehicle';
    public const TYPES = [self::TYPE_PERSON, self::TYPE_VEHICLE];

    public const STATUS_ACTIVE   = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUSES = [self::STATUS_ACTIVE, self::STATUS_INACTIVE];

    protected $fillable = [
        'type',
        'identifier',
        'details',
        'reason',
        'image',
        'status',
    ];

    /**
     * Full URL for the stored image path.
     * Assumes files are saved on the "public" disk; change the disk if yours differs.
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->image
        ? asset('storage/' . $this->image)
        : null;
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /** Every sighting reported for this watch list entry. */
    public function sightings(): HasMany
    {
        return $this->hasMany(SightingReport::class, 'subject_id');
    }

    /** The most recent sighting, handy for "last seen" displays. */
    public function latestSighting(): HasOne
    {
        return $this->hasOne(SightingReport::class, 'subject_id')->latestOfMany();
    }
}