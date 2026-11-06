<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlockedNumber extends Model
{
    use HasFactory;

    protected $fillable = ['phone', 'reason', 'id_number_hash', 'device_id', 'blocked_by'];
}
