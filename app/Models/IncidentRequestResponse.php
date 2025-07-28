<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncidentRequestResponse extends Model
{
    use HasFactory;

    protected $table = 'incident_request_responses';

    protected $fillable = ['user_id', 'incident_type_id', 'location_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function incidentType()
    {
        return $this->belongsTo(IncidentType::class, 'incident_type_id');
    }

    public function location()
    {
        return $this->belongsTo(IncidentLocation::class, 'location_id');
    }

    public function responseRecord()
    {
        return $this->hasOne(IncidentResponseRecord::class, 'request_id');
    }
}
