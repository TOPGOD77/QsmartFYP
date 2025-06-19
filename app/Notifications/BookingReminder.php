<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class BookingReminder extends Notification implements ShouldQueue
{
    use Queueable;

    protected $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail($notifiable)
    {
        $time = $this->booking->booking_time->format('h:i A');
        $date = $this->booking->booking_date->format('d M Y');

        return (new MailMessage)
            ->subject('Upcoming Appointment Reminder')
            ->line("This is a reminder for your upcoming appointment.")
            ->line("Service: {$this->booking->service}")
            ->line("Date: {$date}")
            ->line("Time: {$time}")
            ->line("Branch: {$this->booking->branch}")
            ->action('View Booking', route('queue.show', $this->booking->id));
    }

    public function toWebPush($notifiable, $notification)
    {
        $time = $this->booking->booking_time->format('h:i A');
        
        return (new WebPushMessage)
            ->title('Upcoming Appointment')
            ->icon('/notification-icon.png')
            ->body("Your appointment is coming up at {$time}")
            ->action('View Booking', route('queue.show', $this->booking->id));
    }

    public function toArray($notifiable)
    {
        return [
            'booking_id' => $this->booking->id,
            'service' => $this->booking->service,
            'date' => $this->booking->booking_date->format('Y-m-d'),
            'time' => $this->booking->booking_time->format('H:i'),
            'branch' => $this->booking->branch,
        ];
    }
} 