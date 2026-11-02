<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AreaPersonnel extends Model
{
    // Explicitly declare table name since Laravel might default to singular
    protected $table = 'area_personnel';

    protected $fillable = [
        'user_id',
        'area_id',
        'status',
    ];

    /**
     * The assigned responder.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The assigned area.
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }
}