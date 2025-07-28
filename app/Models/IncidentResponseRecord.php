<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncidentResponseRecord extends Model
{
    use HasFactory;

    protected $table = 'incident_response_records';

    protected $fillable = ['request_id', 'report_id', 'distance', 'response_time'];

    public function request()
    {
        return $this->belongsTo(IncidentRequestResponse::class, 'request_id');
    }

    public function report()
    {
        return $this->belongsTo(IncidentReport::class, 'report_id');
    }
}
