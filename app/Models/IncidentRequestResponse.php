<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncidentRequestResponse extends Model
{
    use HasFactory;

    protected $table = 'incident_request_responses';

    protected $fillable = ['user_id', 'category_id', 'latitude', 'longitude'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(IncidentType::class, 'category_id');
    }

    public function responseRecord()
    {
        return $this->hasOne(IncidentResponseRecord::class, 'request_id');
    }
}
