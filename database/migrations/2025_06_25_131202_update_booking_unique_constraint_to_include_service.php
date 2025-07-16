<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the existing constraint
        try {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropUnique('booking_slot_unique_v2');
            });
        } catch (\Exception $e) {
            // Ignore if constraint doesn't exist
        }

        // Add new constraint that includes service
        Schema::table('bookings', function (Blueprint $table) {
            $table->unique(['branch', 'booking_date', 'booking_time', 'service'], 'booking_slot_service_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropUnique('booking_slot_service_unique');
        });

        // Restore the old constraint
        Schema::table('bookings', function (Blueprint $table) {
            $table->unique(['branch', 'booking_date', 'booking_time'], 'booking_slot_unique_v2');
        });
    }
};
