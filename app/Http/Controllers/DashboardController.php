<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Get current date and time
        $now = now();
        $today = $now->format('Y-m-d');
        
        // Update any past pending appointments to missed
        Booking::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->where(function ($query) use ($now) {
                $query->where('booking_date', '<', $now->format('Y-m-d'))
                    ->orWhere(function ($q) use ($now) {
                        $q->where('booking_date', $now->format('Y-m-d'))
                            ->whereRaw('TIMESTAMP(booking_date, booking_time) < ?', [$now->copy()->subMinutes(10)->format('Y-m-d H:i:s')]);
                    });
            })
            ->update(['status' => 'missed']);

        // Get upcoming and in-progress appointments for the authenticated user
        $upcomingAppointments = Booking::where('user_id', auth()->id())
            ->where(function ($query) use ($now) {
                $query->where('booking_date', '>', $now->format('Y-m-d'))
                    ->orWhere(function ($q) use ($now) {
                        $q->where('booking_date', $now->format('Y-m-d'))
                            ->where('booking_time', '>=', $now->format('H:i:s'));
                    });
            })
            ->whereIn('status', ['pending', 'in_progress'])
            ->orderBy('booking_date')
            ->orderBy('booking_time')
            ->take(5) // Limit to 5 upcoming appointments
            ->get()
            ->map(function ($booking) {
                $status = $booking->status === 'in_progress' ? 'In Progress' : 'Upcoming';
                return [
                    'id' => $booking->id,
                    'service' => $booking->service,
                    'date' => Carbon::parse((string) $booking->booking_date)->format('Y-m-d'),
                    'time' => Carbon::parse($booking->booking_time)->format('h:i A'),
                    'branch' => $booking->branch,
                    'status' => $status
                ];
            });

        $user = auth()->user();
        $recentReview = $user->bookings()
            ->whereHas('review')
            ->with(['review'])
            ->orderByDesc('booking_date')
            ->first()?->review;

        // List of services and their codes
        $serviceCodes = [
            'Account Opening' => 'A',
            'Loan Application' => 'B',
            'Credit Card Services' => 'C',
            'Customer Support & Inquiries' => 'D',
            'Fixed Deposit Consultation' => 'E',
        ];

        // Get the current queue number for each service for today
        $currentQueues = collect($serviceCodes)->mapWithKeys(function ($code, $service) use ($today) {
            $latestBooking = Booking::where('service', $service)
                ->whereDate('booking_date', $today)
                ->orderByDesc('id')
                ->first();
            return [
                $service => [
                    'code' => $code,
                    'queue_number' => $latestBooking ? $latestBooking->queue_number : null,
                ]
            ];
        });

        return Inertia::render('dashboard', [
            'upcomingAppointments' => $upcomingAppointments,
            'recentReview' => $recentReview,
            'currentQueues' => $currentQueues,
        ]);
    }
} 