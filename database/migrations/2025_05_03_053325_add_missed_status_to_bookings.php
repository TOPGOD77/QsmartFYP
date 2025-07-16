<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // First, update any past appointments that are still pending
        \DB::table('bookings')
            ->where('status', 'pending')
            ->where('booking_date', '<', now()->format('Y-m-d'))
            ->orWhere(function ($query) {
                $query->where('status', 'pending')
                    ->where('booking_date', now()->format('Y-m-d'))
                    ->where('booking_time', '<', now()->format('H:i:s'));
            })
            ->update(['status' => 'missed']);

        // Add the new status to the enum if it's not already there
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('status', ['pending', 'in_progress', 'completed', 'missed'])->default('pending')->change();
        });
    }

    public function down()
    {
        // Revert any missed appointments back to pending
        \DB::table('bookings')
            ->where('status', 'missed')
            ->update(['status' => 'pending']);

        // Remove the missed status from the enum
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending')->change();
        });
    }
}; 