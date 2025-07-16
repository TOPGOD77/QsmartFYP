<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // First try to drop the existing constraint if it exists
        try {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropUnique('slot_unique');
            });
        } catch (\Exception $e) {
            // Ignore if constraint doesn't exist
        }

        // Add the constraint with a new name
        Schema::table('bookings', function (Blueprint $table) {
            $table->unique(['branch', 'booking_date', 'booking_time'], 'booking_slot_unique_v2');
        });
    }

    public function down()
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropUnique('booking_slot_unique_v2');
        });
    }
}; 