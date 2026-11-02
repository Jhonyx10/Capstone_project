<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $table = 'groups';

    protected $fillable = ['name', 'capacity'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'group_user')
            ->wherePivotNull('ended_at')
            ->withPivot('assigned_at');
    }
    
    public function assignments()
    {
        return $this->hasMany(GroupAssignment::class);
    }
}