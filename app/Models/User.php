<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name', 'email', 'password', 'identification', 'role', 'status',
        'device_id', 'id_number_hash', 'reject_reason', 'block_reason',
        'blocked_at', 'reviewed_by', 'reviewed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function requests()
    {
        return $this->hasMany(IncidentRequestResponse::class, 'user_id');
    }

    public function reports()
    {
        return $this->hasMany(IncidentReport::class, 'user_id');
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class, 'user_id');
    }

    public function devices()
    {
        return $this->hasMany(UserDevice::class);
    }

    public function routeNotificationForFcm($notification = null)
    {
        // return all tokens linked to this user
        return $this->devices()->pluck('device_token')->filter()->values()->toArray();
    }

    public function chatBoxes()
    {
        return $this->hasMany(ChatBoxModel::class, 'user_id');
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class)->withTimestamps();
    }

    public function assignments()
    {
        return $this->hasMany(GroupAssignment::class);
    }

    public function currentAssignment()
    {
        return $this->hasOne(GroupAssignment::class)->whereNull('ended_at');
    }

    public function assignedAreas(): BelongsToMany
    {
        return $this->belongsToMany(Area::class, 'area_personnel')
                    ->withPivot('status')
                    ->withTimestamps();
    }

    /**
     * Direct access to the assignment pivot records.
     */
    public function areaAssignments(): HasMany
    {
        return $this->hasMany(AreaPersonnel::class);
    }
}
