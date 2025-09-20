<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TanodLocation extends Model
{
    use HasFactory;

    protected $fillable = ['request_id','tanod_id', 'latitude', 'longitude'];
    
    public $timestamps = false;
}
