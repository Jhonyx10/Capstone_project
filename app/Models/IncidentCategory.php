<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncidentCategory extends Model
{
    use HasFactory;

    protected $table = 'incident_categories';

    protected $fillable = ['category_name'];

    public function incidentTypes()
    {
        return $this->hasMany(IncidentType::class, 'category_id');
    }

    public function categories()
    {
        return $this->hasMany(IncidentRequestResponse::class, 'category_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

}
