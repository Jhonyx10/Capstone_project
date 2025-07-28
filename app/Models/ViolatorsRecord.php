<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ViolatorsRecord extends Model
{
    use HasFactory;

    protected $table = 'violators_records';

    protected $fillable = ['report_id', 'violator_id'];

    public function violators()
    {
        return $this->belongsTo(ViolatorsProfile::class, 'violator_id');
    }

    public function reports()
    {
        return $this->belongsTo(IncidentReport::class, 'report_id');
    }
}
