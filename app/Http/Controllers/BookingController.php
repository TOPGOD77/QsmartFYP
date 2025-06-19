<?php

// BookingController.php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Mail\BookingConfirmation;
use Illuminate\Support\Facades\Mail;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        // Log the raw request data
        \Log::info('Raw booking request data', [
            'all_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        try {
            // Validate the request data with custom messages
            $validated = $request->validate([
                'service' => 'required|string',
                'date'    => 'required|date|after_or_equal:today',
                'hour'    => 'required|string',
                'branch'  => 'required|string|in:Bangi'  // Only allow Bangi branch
            ], [
                'date.after_or_equal' => 'You cannot select a date that has already passed. Please choose today or a future date.',
                'date.required' => 'Please select a date for your booking.',
                'hour.required' => 'Please select a time for your booking.',
                'service.required' => 'Please select a service.',
                'branch.required' => 'Branch information is required.',
                'branch.in' => 'Invalid branch selected.'
            ]);

            \Log::info('Request validation passed', [
                'validated_data' => $validated
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            throw $e;
        }

        try {
            // Log the incoming time format for debugging
            \Log::info('Processing booking request', [
                'date' => $request->date,
                'hour' => $request->hour,
                'service' => $request->service,
                'branch' => $request->branch,
                'current_time' => Carbon::now('Asia/Kuala_Lumpur')->format('Y-m-d H:i:s')
            ]);

            // Parse the time using Carbon with the correct format
            // First, ensure the time format is correct (e.g., "09:00AM" -> "09:00 AM")
            $formattedTime = preg_replace('/(\d{2})(\d{2})([AP]M)/', '$1:$2 $3', $request->hour);
            
            \Log::info('Time format processing', [
                'original_time' => $request->hour,
                'formatted_time' => $formattedTime
            ]);
            
            try {
                $time = Carbon::createFromFormat('h:i A', $formattedTime)->format('H:i:s');
                \Log::info('Time parsed successfully', ['parsed_time' => $time]);
            } catch (\Exception $e) {
                \Log::error('Time format parsing failed', [
                    'original_time' => $request->hour,
                    'formatted_time' => $formattedTime,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return back()->withErrors([
                    'time' => 'Invalid time format. Please select a time from the available slots.'
                ])->withInput();
            }
            
            // Create booking datetime
            $bookingDateTime = Carbon::parse($request->date, 'Asia/Kuala_Lumpur')->setTimeFromTimeString($time);
            $now = Carbon::now('Asia/Kuala_Lumpur');
            
            // For same day bookings, compare only the time part
            if ($bookingDateTime->isSameDay($now)) {
                // Convert both times to minutes since midnight for easier comparison
                $bookingMinutes = $bookingDateTime->hour * 60 + $bookingDateTime->minute;
                $currentMinutes = $now->hour * 60 + $now->minute;
                
                \Log::info('Time comparison details', [
                    'booking_time' => $bookingDateTime->format('H:i:s'),
                    'current_time' => $now->format('H:i:s'),
                    'booking_minutes' => $bookingMinutes,
                    'current_minutes' => $currentMinutes,
                    'is_before' => $bookingMinutes < $currentMinutes,
                    'booking_date' => $bookingDateTime->format('Y-m-d'),
                    'current_date' => $now->format('Y-m-d'),
                    'timezone' => $bookingDateTime->timezone->getName()
                ]);

                // Only show error if the booking time is before current time
                if ($bookingMinutes < $currentMinutes) {
                    \Log::info('Time slot validation failed', [
                        'reason' => 'Booking time is before current time',
                        'booking_minutes' => $bookingMinutes,
                        'current_minutes' => $currentMinutes
                    ]);
                    return back()->withErrors([
                        'time' => sprintf(
                            'The selected time (%s) has already passed. Current time is %s. Please select a future time.',
                            $bookingDateTime->format('h:i A'),
                            $now->format('h:i A')
                        )
                    ])->withInput();
                }
            } else if ($bookingDateTime->isPast()) {
                \Log::info('Time slot validation failed', [
                    'reason' => 'Booking date is in the past',
                    'booking_date' => $bookingDateTime->format('Y-m-d'),
                    'current_date' => $now->format('Y-m-d')
                ]);
                return back()->withErrors([
                    'time' => 'The selected date has already passed. Please select today or a future date.'
                ])->withInput();
            }

            \Log::info('Time validation passed', [
                'booking_datetime' => $bookingDateTime->format('Y-m-d H:i:s'),
                'current_datetime' => $now->format('Y-m-d H:i:s'),
                'is_same_day' => $bookingDateTime->isSameDay($now),
                'timezone' => $bookingDateTime->timezone->getName()
            ]);

        } catch (\Exception $e) {
            \Log::error('Time parsing error', [
                'error' => $e->getMessage(),
                'hour' => $request->hour,
                'formatted_time' => $formattedTime ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors([
                'time' => 'There was an error processing your booking time. Please try again.'
            ])->withInput();
        }

        // Check if the slot is already taken
        $existingBooking = Booking::where('branch', 'Bangi')
            ->whereDate('booking_date', $bookingDateTime->format('Y-m-d'))
            ->whereTime('booking_time', $time)
            ->first();

        if ($existingBooking) {
            return back()->withErrors([
                'slot' => 'This time slot is already booked. Please choose a different time.'
            ])->withInput();
        }

        // Create the booking if slot is available
        $booking = Booking::create([
            'service' => $request->service,
            'branch'  => 'Bangi',
            'booking_date' => $bookingDateTime->format('Y-m-d'),
            'booking_time' => $time,
            'user_id' => auth()->id(),
            'status' => 'pending'
        ]);

        // Calculate queue number
        $branchCode = strtoupper(substr($booking->branch, 0, 1));
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
        $formattedTime = Carbon::parse($booking->booking_time)->format('H:i:s');
        $slotNumber = $timeSlots[$formattedTime] ?? 1;
        $queueNumber = sprintf('%s%03d', $branchCode, $slotNumber);

        // Send confirmation email
        try {
            Mail::to($booking->user->email)->send(new BookingConfirmation($booking, $queueNumber));
            \Log::info('Booking confirmation email sent', [
                'booking_id' => $booking->id,
                'user_email' => $booking->user->email,
                'queue_number' => $queueNumber
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send booking confirmation email', [
                'booking_id' => $booking->id,
                'user_email' => $booking->user->email,
                'error' => $e->getMessage()
            ]);
        }

        // Redirect to queue page
        return redirect()->route('queue.show', ['booking' => $booking->id]);
    }

    // Add a method to check available slots
    public function checkAvailability(Request $request)
    {
        $date = Carbon::parse($request->date)->format('Y-m-d');
        $branch = $request->branch;

        // Get all booked slots for the date and branch
        $bookedSlots = Booking::where('branch', $branch)
            ->whereDate('booking_date', $date)
            ->pluck('booking_time')
            ->map(function($time) {
                return Carbon::parse($time)->format('h:iA');
            })
            ->toArray();

        return response()->json([
            'bookedSlots' => $bookedSlots
        ]);
    }
}
