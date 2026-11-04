<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SightingReport extends Model
{
    use HasFactory;

    protected $table = 'sighting_reports';

    protected $fillable = [
        'reporter_id',
        'subject_id',
        'location',
        'latitude',
        'longitude',
        'note',
    ];

    // Numbers instead of strings in JSON, which map libraries expect
    protected $casts = [
        'latitude'  => 'float',
        'longitude' => 'float',
    ];

    /** The user who filed the sighting. */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /** The watch list entry that was sighted (still loads if it was soft-deleted). */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(WatchList::class, 'subject_id')->withTrashed();
    }
}