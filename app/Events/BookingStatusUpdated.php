<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $booking;
    public $queuePosition;

    public function __construct(Booking $booking, $queuePosition)
    {
        $this->booking = $booking;
        $this->queuePosition = $queuePosition;
    }

    public function broadcastOn()
    {
        return new Channel('staff-dashboard');
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->booking->id,
            'status' => $this->booking->status,
            'queuePosition' => $this->queuePosition,
            'customer' => [
                'name' => $this->booking->user->name,
                'email' => $this->booking->user->email,
            ],
            'service' => $this->booking->service,
            'date' => $this->booking->booking_date->format('Y-m-d'),
            'time' => $this->booking->booking_time->format('H:i'),
            'branch' => $this->booking->branch,
            'notes' => $this->booking->notes,
        ];
    }
} 