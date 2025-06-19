<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:1000',
        ]);

        // Prevent duplicate reviews
        if ($booking->review) {
            return back()->with('error', 'You have already submitted a review for this appointment.');
        }

        $booking->review()->create($validated);

        return back()->with('success', 'Thank you for your feedback!');
    }
}
