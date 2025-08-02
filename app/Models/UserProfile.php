<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $table = 'user_profiles';

    protected $fillable = ['user_id', 'last_name', 'first_name', 'age', 'zone_id', 'address', 'photo'];

    public function user()
    {
        return $this->hasOne(User::class, 'user_id');
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class, 'zone_id');
    }
}
