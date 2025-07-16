<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Inertia\Inertia;
use Carbon\Carbon;

class QueueController extends Controller
{
    // Laravel will automatically inject the Booking model based on the {booking} route parameter
    public function show(Booking $booking)
    {
        // Set timezone to Malaysia (GMT+8)
        $now = Carbon::now('Asia/Kuala_Lumpur');
        $branchCode = strtoupper(substr($booking->branch, 0, 1));

        // Initialize timezone adjusted variables
        $nowInKL = $now->copy()->setTimezone('Asia/Kuala_Lumpur');
        $bookingInKL = null;

        // Get the booking time
        $bookingTime = $booking->booking_time;
        if (is_string($bookingTime)) {
            $bookingTime = Carbon::createFromFormat('H:i:s', $bookingTime);
        }

        // Define the time slots and their corresponding numbers
        $timeSlots = [
            '09:00:00' => 1,  // B001
            '09:30:00' => 2,  // B002
            '10:00:00' => 3,  // B003
            '10:30:00' => 4,  // B004
            '11:00:00' => 5,  // B005
            '11:30:00' => 6,  // B006
            '12:30:00' => 7,  // B007
            '14:00:00' => 8,  // B008
            '14:30:00' => 9,  // B009
            '15:00:00' => 10, // B010
            '15:30:00' => 11, // B011
            '16:00:00' => 12  // B012
        ];

        // Get the formatted time in 24-hour format
        $formattedTime = $bookingTime->format('H:i:s');
        
        // Get the slot number from the time slots array
        $slotNumber = $timeSlots[$formattedTime] ?? 1;

        // Use the new queue_number accessor
        $turnNumber = $booking->queue_number;

        \Log::info('Queue number calculation', [
            'booking_time' => $formattedTime,
            'slot_number' => $slotNumber,
            'turn_number' => $turnNumber,
            'time_slots' => $timeSlots
        ]);

        // Get daily queue number (resets each day)
        $dailyQueueNumber = Booking::where('branch', $booking->branch)
        ->whereDate('booking_date', (string) $booking->booking_date)
            ->where('id', '<=', $booking->id)
            ->count();

        // 1) Pull out just the date and just the time:
        $datePart = $booking->booking_date instanceof Carbon
            ? $booking->booking_date->format('Y-m-d')
            : (string) $booking->booking_date;

        $timePart = $booking->booking_time instanceof Carbon
            // if it's Carbon, format to 12-hour with AM/PM:
            ? $booking->booking_time->format('h:i A')
            : (string) $booking->booking_time; // e.g. "10:00 AM"

        // 2) Build a clean "YYYY-MM-DD hh:mm AM/PM" string:
        $bookingDateTimeString = "{$datePart} {$timePart}";

        // 3) Parse in KL time once:
        $bookingDateTime = Carbon::parse(
            $bookingDateTimeString,
            'Asia/Kuala_Lumpur'
        );

        // 4) (Optional) log to confirm you really have "10:00:00" and not "18:00:00":
        \Log::info('Booking DateTime Debug', [
            'raw_string'         => $bookingDateTimeString,
            'booking_datetime'   => $bookingDateTime->toDateTimeString(), 
            'current_time'       => $now->toDateTimeString(),
            'time_diff_minutes'  => $now->diffInMinutes($bookingDateTime, false),
            'booking_hour'       => $bookingDateTime->format('H'),
            'booking_minute'     => $bookingDateTime->format('i'),
            'is_am'             => $bookingDateTime->format('A') === 'AM',
            'timezone'          => $bookingDateTime->timezone->getName()
        ]);

        // Calculate people ahead in queue
        $peopleAhead = Booking::where('branch', $booking->branch)
            ->whereDate('booking_date', (string) $booking->booking_date)
            ->where('service', $booking->service) // Only count same service
            ->where('status', 'pending')
            ->where(function($query) use ($booking, $now, $bookingTime) {
                $query->where(function($q) use ($booking, $now, $bookingTime) {
                    $q->whereTime('booking_time', '<', $bookingTime->format('H:i:s'));
                });
            })
            ->count();

        // Initialize variables for the response
        $waitingTime = 0;
        $formattedWaitTime = '';
        $isPastBooking = $now->gt($bookingDateTime);
        $statusMessage = '';

        if ($isPastBooking) {
            // For past bookings, show status message instead of waiting time
            if ($booking->status === 'completed') {
                $statusMessage = 'Appointment Completed';
            } else if ($booking->status === 'missed') {
                $statusMessage = 'Appointment Missed';
            } else {
                $statusMessage = 'Appointment Ended';
            }
            $peopleAhead = 0; // No people ahead for past bookings
        } else if ($booking->status === 'in_progress') {
            $statusMessage = 'Your service is currently being served';
            $peopleAhead = 0; // No people ahead when being served
        } else {
            // Calculate waiting time for future bookings
            // First, ensure both times are in the same timezone
            $nowInKL = $now->copy()->setTimezone('Asia/Kuala_Lumpur');
            $bookingInKL = $bookingDateTime->copy()->setTimezone('Asia/Kuala_Lumpur');
            
            // Calculate the time difference in minutes - only real time from now until booking
            $waitingTime = $nowInKL->diffInMinutes($bookingInKL);

            // Debug the waiting time calculation with more detail
            \Log::info('Waiting Time Calculation', [
                'current_time' => $nowInKL->format('Y-m-d H:i:s'),
                'booking_time' => $bookingInKL->format('Y-m-d H:i:s'),
                'waiting_time' => $waitingTime,
                'current_timestamp' => $nowInKL->timestamp,
                'booking_timestamp' => $bookingInKL->timestamp,
                'diff_seconds' => $bookingInKL->timestamp - $nowInKL->timestamp,
                'timezone' => $nowInKL->timezone->getName()
            ]);

            // Format waiting time into days, hours and minutes
            $days = floor($waitingTime / (24 * 60));
            $hours = floor(($waitingTime % (24 * 60)) / 60);
            $minutes = $waitingTime % 60;
            
            $formattedWaitTime = '';
            if ($days > 0) {
                $formattedWaitTime = $days . ' day' . ($days !== 1 ? 's' : '') . ' ';
            }
            if ($hours > 0) {
                $formattedWaitTime .= $hours . ' hour' . ($hours !== 1 ? 's' : '') . ' ';
            }
            if ($minutes > 0 || ($days === 0 && $hours === 0)) {
                $formattedWaitTime .= $minutes . ' minute' . ($minutes !== 1 ? 's' : '');
            }

            // If no waiting time calculated but it's a future booking, show at least 1 minute
            if (empty($formattedWaitTime) && $bookingInKL->gt($nowInKL)) {
                $formattedWaitTime = '1 minute';
            }
        }

        // Detailed debug information
        \Log::info('Queue Calculation Details', [
            'current_time' => $now->format('Y-m-d H:i:s'),
            'current_time_kl' => $nowInKL->format('Y-m-d H:i:s'),
            'booking_date' => ($booking->booking_date instanceof Carbon)
                ? $booking->booking_date->format('Y-m-d')
                : Carbon::parse((string) $booking->booking_date)->format('Y-m-d'),
            'booking_time' => $bookingTime->format('h:i A'),
            'booking_datetime' => isset($bookingDateTime) ? $bookingDateTime->format('Y-m-d H:i:s') : null,
            'booking_datetime_kl' => isset($bookingInKL) ? $bookingInKL->format('Y-m-d H:i:s') : null,
            'is_same_day' => isset($bookingInKL) ? ($nowInKL->format('Y-m-d') === $bookingInKL->format('Y-m-d')) : null,
            'time_until_booking_minutes' => $waitingTime ?? 0,
            'people_ahead' => $peopleAhead,
            'formatted_wait_time' => $formattedWaitTime,
            'is_past_booking' => $isPastBooking,
            'status_message' => $statusMessage
        ]);

        return Inertia::render('queue/QueuePage', [
            'turnNumber'    => $turnNumber,
            'estimatedMins' => $waitingTime,
            'estimatedWaitTime' => trim($formattedWaitTime),
            'service'       => $booking->service,
            'branch'        => $booking->branch,
            'date'          => $bookingDateTime->format('d M Y'),
            'time'          => $bookingTime->format('h:i A'),
            'currentTime'   => $now->format('h:i A'),
            'bookingTime'   => $bookingTime->format('h:i A'),
            'isPastBooking' => $isPastBooking,
            'statusMessage' => $statusMessage,
            'peopleAhead'   => $peopleAhead,
            'bookingId'     => $booking->id,
            'hasReview'     => $booking->review()->exists(),
        ]);
    }
}
