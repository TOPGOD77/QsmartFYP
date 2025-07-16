<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Booking extends Model
{
    use HasFactory;

    // These columns must match your DB schema
    protected $fillable = [
        'user_id',
        'staff_id',
        'service',
        'branch',
        'booking_date',
        'booking_time',
        'status', // 'pending', 'in_progress', 'completed', 'cancelled'
        'notes'
    ];

    // Cast booking_date to a Carbon instance
    protected $casts = [
        'booking_date' => 'date',
        'booking_time' => 'datetime',
    ];

    // Convert booking_time to Carbon instance when accessing
    public function getBookingTimeAttribute($value)
    {
        return $value ? Carbon::parse($value) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForDepartment($query, $department)
    {
        return $query->where('service', $department);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted()
    {
        static::creating(function ($booking) {
            // Check for duplicate slots before saving (now includes service)
            $exists = static::where('branch', $booking->branch)
                ->whereDate('booking_date', $booking->booking_date)
                ->whereTime('booking_time', $booking->booking_time)
                ->where('service', $booking->service)
                ->exists();

            if ($exists) {
                throw new \Exception('This time slot is already booked for this service.');
            }
        });
    }

    public function getQueueNumberAttribute()
    {
        $serviceCodes = [
            'Account Opening' => 'A',
            'Loan Application' => 'B',
            'Credit Card Services' => 'C',
            'Customer Support & Inquiries' => 'D',
            'Fixed Deposit Consultation' => 'E',
        ];
        $serviceCode = $serviceCodes[$this->service] ?? 'X';
        $nextSequence = Booking::where('service', $this->service)
            ->whereDate('booking_date', (string) $this->booking_date)
            ->where('id', '<=', $this->id)
            ->count();
        return sprintf('%s%03d', $serviceCode, $nextSequence);
    }
}
