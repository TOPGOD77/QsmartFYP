<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class QueueUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // The booking object that will be sent to the frontend
    public $booking;

    /**
     * Create a new event instance.
     *
     * @param  \App\Models\Booking  $booking
     * @return void
     */
    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // Broadcast the event on the channel specific to the branch
        return new Channel('queue.' . $this->booking->branch);
    }

    /**
     * Get the data to send with the broadcast.
     *
     * @return array
     */
    public function broadcastWith()
    {
        // Calculate queue number based on time slots
        $bookingTime = $this->booking->booking_time;
        if (is_string($bookingTime)) {
            $bookingTime = Carbon::createFromFormat('h:iA', str_replace(':', '', $bookingTime));
        }

        // Start from 9 AM (09:00) and increment for each 30-minute slot
        $startTime = Carbon::createFromTime(9, 0, 0); // 9 AM
        $timeDiff = $bookingTime->diffInMinutes($startTime);
        $slotNumber = floor($timeDiff / 30) + 1; // Each slot is 30 minutes

        // Format turn number with branch code and slot number
        $turnNumber = sprintf('%s%03d', strtoupper($this->booking->branch[0]), $slotNumber);

        return [
            'turnNumber'   => $turnNumber,
            'ahead'        => $this->getAheadCount(),
            'estimatedMins'=> $this->getEstimatedWaitTime(),
            'service'      => $this->booking->service,
            'branch'       => $this->booking->branch,
            'date'         => $this->booking->booking_date->format('d M Y'),
            'time'         => $this->booking->booking_time->format('H:i'),
        ];
    }

    /**
     * Get the number of people ahead in the queue.
     *
     * @return int
     */
    public function getAheadCount()
    {
        return Booking::where('branch', $this->booking->branch)
                      ->where('service', $this->booking->service)
                      ->where('booking_date', $this->booking->booking_date)
                      ->where('booking_time', '>=', $this->booking->booking_time)
                      ->where('id', '<', $this->booking->id)
                      ->count();
    }

    /**
     * Get the estimated wait time.
     *
     * @return int
     */
    public function getEstimatedWaitTime()
    {
        // Assuming 10 minutes per customer
        $avgServiceMins = 10;
        return $this->getAheadCount() * $avgServiceMins;
    }
}
