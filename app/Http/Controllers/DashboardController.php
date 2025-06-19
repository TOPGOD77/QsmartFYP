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
        
        // Update any past pending appointments to missed
        Booking::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->where(function ($query) use ($now) {
                $query->where('booking_date', '<', $now->format('Y-m-d'))
                    ->orWhere(function ($q) use ($now) {
                        $q->where('booking_date', $now->format('Y-m-d'))
                            ->where('booking_time', '<', $now->format('H:i:s'));
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
                    'date' => Carbon::parse($booking->booking_date)->format('Y-m-d'),
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

        return Inertia::render('dashboard', [
            'upcomingAppointments' => $upcomingAppointments,
            'recentReview' => $recentReview,
        ]);
    }
} 