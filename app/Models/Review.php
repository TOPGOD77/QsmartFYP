<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = ['booking_id', 'rating', 'feedback'];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
