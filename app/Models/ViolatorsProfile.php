<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ViolatorsProfile extends Model
{
    use HasFactory;

    protected $table = 'violators_profiles';

    protected $fillable = ['last_name', 'first_name', 'age', 'address', 'photo'];

    public function violationRecords()
    {
        return $this->hasMany(ViolatorsRecord::class, 'violator_id');
    }

    public function reports()
    {
        return $this->belongsToMany(
            IncidentReport::class,
            'violators_records',
            'violator_id',
            'report_id',
        );
    }
    }
