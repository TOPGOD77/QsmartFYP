<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $queueNumber;

    /**
     * Create a new message instance.
     */
    public function __construct(Booking $booking, string $queueNumber)
    {
        $this->booking = $booking;
        $this->queueNumber = $queueNumber;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Booking Confirmation - QSmart')
                    ->view('emails.booking-confirmation');
    }
} 