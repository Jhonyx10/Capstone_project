<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatBoxModel extends Model
{
    use HasFactory;

    protected $table = 'chat_box_models';

    protected $fillable = [
        'request_id', 'user_id', 'message'
    ];

    public function users()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function request()
    {
        return $this->belongsTo(IncidentRequestResponse::class, 'request_id');
    }

}
