<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncidentEvidence extends Model
{
    use HasFactory;

    protected $table = 'incident_evidence';

    protected $fillable = ['report_id', 'incident_evidence', 'remarks'];

    public function report()
    {
        return $this->belongsTo(IncidentReport::class, 'report_id');
    }
}
