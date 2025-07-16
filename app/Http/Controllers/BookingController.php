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
        \Log::info('Raw booking request data', [
            'all_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        try {
            $validated = $this->validateBookingRequest($request);
            $time = $this->parseBookingTime($request->hour);
            $bookingDateTime = $this->createBookingDateTime($request->date, $time);
            $this->validateBookingDateTime($bookingDateTime);

            // Check if the slot is already taken for this specific service
            $existingBooking = Booking::where('branch', 'Bangi')
                ->whereDate('booking_date', $bookingDateTime->format('Y-m-d'))
                ->whereTime('booking_time', $time)
                ->where('service', $request->service)
                ->first();

            if ($existingBooking) {
                return back()->withErrors([
                    'slot' => 'This time slot is already booked for this service. Please choose a different time or service.'
                ])->withInput();
            }

            $booking = $this->createBooking($request, $time, $bookingDateTime);
            $queueNumber = $this->calculateQueueNumber($booking);
            $this->sendConfirmationEmail($booking, $queueNumber);

            return redirect()->route('queue.show', ['booking' => $booking->id]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Booking creation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors([
                'general' => 'There was an error processing your booking. Please try again.'
            ])->withInput();
        }
    }

    private function validateBookingRequest(Request $request): array
    {
        return $request->validate([
            'service' => 'required|string',
            'date'    => 'required|date|after_or_equal:today',
            'hour'    => 'required|string',
            'branch'  => 'required|string|in:Bangi'
        ], [
            'date.after_or_equal' => 'You cannot select a date that has already passed. Please choose today or a future date.',
            'date.required' => 'Please select a date for your booking.',
            'hour.required' => 'Please select a time for your booking.',
            'service.required' => 'Please select a service.',
            'branch.required' => 'Branch information is required.',
            'branch.in' => 'Invalid branch selected.'
        ]);
    }

    private function parseBookingTime(string $hour): string
    {
        $formattedTime = preg_replace('/(\d{2})(\d{2})([AP]M)/', '$1:$2 $3', $hour);
        
        try {
            return Carbon::createFromFormat('h:i A', $formattedTime)->format('H:i:s');
        } catch (\Exception $e) {
            throw new \Exception('Invalid time format. Please select a time from the available slots.');
        }
    }

    private function createBookingDateTime(string $date, string $time): Carbon
    {
        return Carbon::parse($date, 'Asia/Kuala_Lumpur')->setTimeFromTimeString($time);
    }

    private function validateBookingDateTime(Carbon $bookingDateTime): void
    {
        $now = Carbon::now('Asia/Kuala_Lumpur');
        
        if ($bookingDateTime->isSameDay($now)) {
            $bookingMinutes = $bookingDateTime->hour * 60 + $bookingDateTime->minute;
            $currentMinutes = $now->hour * 60 + $now->minute;
            
            if ($bookingMinutes < $currentMinutes) {
                throw new \Exception(sprintf(
                    'The selected time (%s) has already passed. Current time is %s. Please select a future time.',
                    $bookingDateTime->format('h:i A'),
                    $now->format('h:i A')
                ));
            }
        } elseif ($bookingDateTime->isPast()) {
            throw new \Exception('The selected date has already passed. Please select today or a future date.');
        }
    }

    private function createBooking(Request $request, string $time, Carbon $bookingDateTime): Booking
    {
        return Booking::create([
            'service' => $request->service,
            'branch'  => 'Bangi',
            'booking_date' => $bookingDateTime->format('Y-m-d'),
            'booking_time' => $time,
            'user_id' => auth()->id(),
            'status' => 'pending'
        ]);
    }

    private function calculateQueueNumber(Booking $booking): string
    {
        // Map services to their respective codes (based on actual services)
        $serviceCodes = [
            'Account Opening' => 'A',
            'Loan Application' => 'B',
            'Credit Card Services' => 'C',
            'Customer Support & Inquiries' => 'D',
            'Fixed Deposit Consultation' => 'E',
        ];

        // Get the service code, default to 'X' if not found
        $serviceCode = $serviceCodes[$booking->service] ?? 'X';

        // Get the next sequence number for this service on this date
        $nextSequence = Booking::where('service', $booking->service)
            ->whereDate('booking_date', (string) $booking->booking_date)
            ->where('id', '<=', $booking->id)
            ->count();

        // Format: ServiceCode + 3-digit sequence number (e.g., A001, B002, C001)
        return sprintf('%s%03d', $serviceCode, $nextSequence);
    }

    private function sendConfirmationEmail(Booking $booking, string $queueNumber): void
    {
        try {
            Mail::to($booking->user->email)->send(new BookingConfirmation($booking, $queueNumber));
        } catch (\Exception $e) {
            \Log::error('Failed to send booking confirmation email', [
                'booking_id' => $booking->id,
                'user_email' => $booking->user->email,
                'error' => $e->getMessage()
            ]);
        }
    }

    // Add a method to check available slots
    public function checkAvailability(Request $request)
    {
        $date = Carbon::parse($request->date)->format('Y-m-d');
        $branch = $request->branch;
        $service = $request->service;

        // Get all booked slots for the date, branch, and specific service
        $bookedSlots = Booking::where('branch', $branch)
            ->whereDate('booking_date', $date)
            ->where('service', $service)
            ->pluck('booking_time')
            ->map(function($time) {
                return Carbon::parse($time)->format('h:iA');
            })
            ->toArray();

        return response()->json([
            'bookedSlots' => $bookedSlots
        ]);
    }

    public function requestEdit(Request $request)
    {
        $validated = $request->validate([
            'bookingId' => 'required|exists:bookings,id',
            'newService' => 'required|string',
            'newDate' => 'required|date',
            'newTime' => 'required',
            'reason' => 'required|string',
        ]);

        // TODO: Send email to admin or store in DB
        // For now, just return success
        return back()->with('success', 'Your edit request has been sent to the admin.');
    }
}
