<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BookingHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::where('user_id', auth()->id());

        // Add status filter
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Add date filter
        if ($request->filled('selected_date')) {
            $query->whereDate('booking_date', $request->input('selected_date'));
        }

        // Add date sorting
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy('booking_date', $sortOrder)
              ->orderBy('booking_time', $sortOrder);

        $bookings = $query->paginate(10);

        return Inertia::render('booking/history', [
            'bookings' => $bookings->map(fn ($booking) => [
                'id' => $booking->id,
                'service' => $booking->service,
                'date' => $booking->booking_date ? Carbon::parse($booking->booking_date)->format('jS M Y') : '-',
                'time' => $booking->booking_time ? Carbon::parse($booking->booking_time)->format('h:i A') : '-',
                'branch' => $booking->branch,
                'status' => $booking->status === 'missed' ? 'Missed' : 
                          ($booking->status === 'completed' ? 'Completed' : 
                          ($booking->status === 'in_progress' ? 'In Progress' : 'Pending')),
                'statusClass' => $booking->status === 'missed' ? 'text-red-600' : 
                               ($booking->status === 'completed' ? 'text-green-600' : 
                               ($booking->status === 'in_progress' ? 'text-blue-600' : 'text-yellow-600'))
            ]),
            'currentPage' => $bookings->currentPage(),
            'totalPages' => $bookings->lastPage(),
            'selectedStatus' => $request->input('status', ''),
            'selectedDate' => $request->input('selected_date', ''),
            'sortOrder' => $sortOrder,
        ]);
    }
} 