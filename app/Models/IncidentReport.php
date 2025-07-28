<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncidentReport extends Model
{
    use HasFactory;

    protected $table = 'incident_reports';

    protected $fillable = ['incident_type_id', 'data', 'time', 'location_id', 'report_description', 'user_id'];

    public function incidentType()
    {
        return $this->belongsTo(IncidentType::class, 'incident_type_id');
    }

    public function location()
    {
        return $this->belongsTo(IncidentLocation::class, 'location_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function evidences()
    {
        return $this->hasMany(IncidentEvidence::class, 'report_id');
    }

    public function responseRecord()
    {
        return $this->hasOne(IncidentResponseRecord::class, 'report_id');
    }

    public function violatorsRecords()
    {
        return $this->hasMany(ViolatorsRecord::class, 'report_id');
    }

    public function violators()
    {
        return $this->belongsToMany(
            ViolatorsProfile::class,
            'violators_records',
            'report_id',
            'violator_id',
        );
    }
}
