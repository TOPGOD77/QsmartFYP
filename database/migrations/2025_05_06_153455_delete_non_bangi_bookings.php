<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class DeleteNonBangiBookings extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Delete all bookings except those from Bangi branch
        DB::table('bookings')
            ->where('branch', '!=', 'Bangi')
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be reversed as it deletes data
    }
}
