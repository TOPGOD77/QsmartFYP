<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        // Get current time in Malaysia timezone
        $now = Carbon::now('Asia/Kuala_Lumpur');
        $today = Carbon::today('Asia/Kuala_Lumpur');

        // Update any past pending appointments to missed
        Booking::whereDate('booking_date', $today)
            ->where('status', 'pending')
            ->where(function($query) use ($now) {
                $query->whereDate('booking_date', '<', $now->format('Y-m-d'))
                    ->orWhere(function($q) use ($now) {
                        $q->whereDate('booking_date', $now->format('Y-m-d'))
                            ->whereTime('booking_time', '<', $now->format('H:i:s'));
                    });
            })
            ->update(['status' => 'missed']);

        $query = Booking::with('user:id,name,email');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ;
            })->orWhere('service', 'like', "%$search%");
        }
        if ($request->filled('status')) {
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

        // Always calculate today's stats from ALL bookings (not paginated)
        $todayBookings = Booking::with('user:id,name,email')
            ->whereDate('booking_date', $today)
            ->get();

        $dateStats[$today->format('Y-m-d')] = [
            'total' => $todayBookings->count(),
            'pending' => $todayBookings->where('status', 'pending')->count(),
            'in_progress' => $todayBookings->where('status', 'in_progress')->count(),
            'completed' => $todayBookings->where('status', 'completed')->count(),
            'missed' => $todayBookings->where('status', 'missed')->count(),
        ];

        // Total bookings (all time, all departments)
        $totalBookings = Booking::count();

        // --- Analytics Data ---
        // 1. Booking Trends (by date, last 30 days)
        $bookingTrends = Booking::selectRaw('DATE(booking_date) as date, COUNT(*) as count')
            ->where('booking_date', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // 2. Service Popularity
        $servicePopularity = Booking::selectRaw('service, COUNT(*) as count')
            ->groupBy('service')
            ->orderByDesc('count')
            ->get();

        // 3. Status Breakdown
        $statusBreakdown = Booking::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        // 4. Branch Performance
        $branchPerformance = Booking::selectRaw('branch, COUNT(*) as count')
            ->groupBy('branch')
            ->orderByDesc('count')
            ->get();

        return Inertia::render('AdminDashboard', [
            'auth' => [
                'user' => $request->user(),
            ],
            'bookingsPaginator' => $bookingsPaginator,
            'groupedBookings' => $groupedBookings,
            'dateStats' => $dateStats,
            'totalBookings' => $totalBookings,
            'todayDate' => $today->format('Y-m-d'),
            'bookingTrends' => $bookingTrends,
            'servicePopularity' => $servicePopularity,
            'statusBreakdown' => $statusBreakdown,
            'branchPerformance' => $branchPerformance,
        ]);
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();
        return redirect()->back()->with('success', 'Booking deleted successfully.');
    }
} 