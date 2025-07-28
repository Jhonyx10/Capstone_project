<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncidentType extends Model
{
    use HasFactory;

    protected $table = 'incident_types';

    protected $fillable = ['category_id', 'incident_name'];

    public function category()
    {
        return $this->belongsTo(IncidentCategory::class, 'category_id');
    }

    public function reports()
    {
        return $this->hasMany(IncidentReport::class, 'incident_type_id');
    }

    public function requests()
    {
        return $this->hasMany(IncidentRequestResponse::class, 'incident_type_id');
    }
}
