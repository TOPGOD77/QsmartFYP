<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\BookingHistoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StaffDashboardController;
use App\Http\Middleware\StaffMiddleware;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Settings\ProfileController as SettingsProfileController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Regular user routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Staff routes
Route::middleware(['auth', 'verified', StaffMiddleware::class])->prefix('staff')->name('staff.')->group(function () {
    Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('dashboard');
    Route::post('/bookings/{booking}/status', [StaffDashboardController::class, 'updateStatus'])->name('bookings.update-status');
    Route::post('/bookings/{booking}/notes', [StaffDashboardController::class, 'updateNotes'])->name('bookings.update-notes');
    Route::get('/bookings/{booking}/manage', [StaffDashboardController::class, 'manage'])->name('booking.manage');
});

// Staff dashboard without prefix (rename route)
Route::middleware(['auth', 'verified', StaffMiddleware::class])
    ->get('/StaffDashboard', [StaffDashboardController::class, 'index'])
    ->name('staff.dashboard.alt');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::get('/booking', function (Request $request) {
    return Inertia::render('booking/bookingpage', [
        'service' => $request->query('service',''),
        'date'    => $request->query('date',''),
        'branch'  => $request->query('branch',''),
        'errors'  => session('errors') ? session('errors')->getBag('default')->getMessages() : [],
    ]);
})->name('booking');

// Booking
Route::middleware(['auth','verified'])->group(function () {
    Route::post('/booking', [BookingController::class, 'store'])
         ->name('booking.store');

    Route::get('/queue/{booking}', [QueueController::class, 'show'])
         ->name('queue.show');
});

// Regular user routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/booking/history', [BookingHistoryController::class, 'index'])->name('booking.history');
    Route::get('/profile', [SettingsProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [SettingsProfileController::class, 'update'])->name('profile.update');
});

Route::post('/queue/{booking}/review', [ReviewController::class, 'store'])->name('queue.review')->middleware('auth');

Route::get('/booking/create', [BookingController::class, 'create'])->name('booking.create');

// Route::get('/something-else', [OtherController::class, 'index'])->name('staff.dashboard.other');

Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

Route::delete('/admin/bookings/{booking}', [AdminDashboardController::class, 'destroy'])->name('admin.bookings.destroy');

Route::put('/admin/bookings/{booking}', [AdminDashboardController::class, 'update'])->name('admin.bookings.update');

Route::post('/booking/request-edit', [App\Http\Controllers\BookingController::class, 'requestEdit'])->name('booking.requestEdit');