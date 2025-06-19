<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class StaffDashboardController extends Controller
{
    public function index(Request $request)
    {
        // Get current time in Malaysia timezone
        $now = Carbon::now('Asia/Kuala_Lumpur');
        $today = Carbon::today('Asia/Kuala_Lumpur');

        // Update any past pending appointments to missed
        Booking::where('status', 'pending')
            ->where(function($query) use ($now) {
                $query->where(function($q) use ($now) {
                    // Create a Carbon instance from booking_date and booking_time
                    $q->whereRaw("CONCAT(booking_date, ' ', booking_time) < ?", [$now->format('Y-m-d H:i:s')]);
                });
            })
            ->update(['status' => 'missed']);

        $query = Booking::with('user:id,name,email');

        // Filter by staff's department
        $department = $request->user()->department;
        \Log::info('Staff department:', ['department' => $department]);
        
        // Map department to service name
        $serviceMap = [
            'Customer Service' => 'Customer Support & Inquiries',
            // Add other mappings if needed
        ];
        
        $service = $serviceMap[$department] ?? $department;

        // Calculate total stats for all bookings first (before any filtering)
        $allBookings = Booking::all();
        $totalStats = [
            'total' => $allBookings->count(),
            'pending' => $allBookings->where('status', 'pending')->count(),
            'in_progress' => $allBookings->where('status', 'in_progress')->count(),
            'completed' => $allBookings->where('status', 'completed')->count(),
            'missed' => $allBookings->where('status', 'missed')->count(),
        ];

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            })->orWhere('service', 'like', "%$search%");
        }
        if ($request->filled('status') && $request->input('status') !== '') {
            \Log::info('Filtering by status:', ['status' => $request->input('status')]);
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('date')) {
            $query->whereDate('booking_date', $request->input('date'));
        }

        $perPage = 10;
        $bookingsPaginator = $query
            ->orderBy('booking_date')
            ->orderBy('booking_time')
            ->paginate($perPage)
            ->through(function ($booking) {
                return [
                    'id' => $booking->id,
                    'customer' => [
                        'name' => $booking->user->name,
                        'email' => $booking->user->email,
                    ],
                    'service' => $booking->service,
                    'date' => $booking->booking_date->format('Y-m-d'),
                    'time' => $booking->booking_time->format('H:i'),
                    'branch' => $booking->branch,
                    'status' => $booking->status,
                    'notes' => $booking->notes,
                ];
            });

        \Log::info('Bookings after filtering:', ['count' => $bookingsPaginator->total()]);

        // Log the query results
        \Log::info('Bookings query results:', [
            'total' => $bookingsPaginator->total(),
            'current_page' => $bookingsPaginator->currentPage(),
            'per_page' => $bookingsPaginator->perPage(),
            'first_item' => $bookingsPaginator->firstItem(),
            'last_item' => $bookingsPaginator->lastItem(),
        ]);

        // Group bookings by date (for stats)
        $groupedBookings = collect($bookingsPaginator->items())->groupBy('date');

        // Calculate stats for each date (from paginated bookings)
        $dateStats = [];
        foreach ($groupedBookings as $date => $dateBookings) {
            $dateStats[$date] = [
                'total' => count($dateBookings),
                'pending' => collect($dateBookings)->where('status', 'pending')->count(),
                'in_progress' => collect($dateBookings)->where('status', 'in_progress')->count(),
                'completed' => collect($dateBookings)->where('status', 'completed')->count(),
                'missed' => collect($dateBookings)->where('status', 'missed')->count(),
            ];
        }

        return Inertia::render('StaffDashboard', [
            'bookingsPaginator' => $bookingsPaginator,
            'groupedBookings' => $groupedBookings,
            'dateStats' => $dateStats,
            'totalStats' => $totalStats,
            'todayDate' => $today->format('Y-m-d'),
            'department' => $department,
        ]);
    }

    public function updateStatus(Request $request, Booking $booking)
    {
        try {
            \Log::info('Update status request received', [
                'booking_id' => $booking->id,
                'request_status' => $request->input('status'),
                'request_notes' => $request->input('notes'),
                'request_all' => $request->all(),
                'request_method' => $request->method(),
                'request_headers' => $request->headers->all()
            ]);

            // Validate request
            $validated = $request->validate([
                'status' => 'required|in:pending,in_progress,completed',
                'notes' => 'nullable|string',
            ]);

            // Update booking
            $updated = $booking->update([
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
                'staff_id' => $request->user()->id,
            ]);

            if ($updated) {
                // Calculate queue position for all pending bookings
                $queuePosition = Booking::where('branch', $booking->branch)
                    ->whereDate('booking_date', $booking->booking_date)
                    ->where('status', 'pending')
                    ->where(function($query) use ($booking) {
                        $query->whereTime('booking_time', '<', $booking->booking_time)
                            ->orWhere(function($q) use ($booking) {
                                $q->whereTime('booking_time', '=', $booking->booking_time)
                                    ->where('id', '<', $booking->id);
                            });
                    })
                    ->count();

                // Broadcast the update
                event(new \App\Events\BookingStatusUpdated($booking, $queuePosition));

                return response()->json([
                    'message' => 'Booking status updated successfully',
                ]);
            }

            return response()->json([
                'message' => 'Failed to update booking status'
            ], 500);

        } catch (\Exception $e) {
            \Log::error('Error updating booking status', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'An error occurred while updating the booking status'
            ], 500);
        }
    }
} 