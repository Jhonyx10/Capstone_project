<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $table = 'user_profiles';

    protected $fillable = ['user_id', 'last_name', 'first_name', 'age', 'address', 'photo'];

    public function user()
    {
        return $this->hasOne(User::class, 'user_id');
    }
}
