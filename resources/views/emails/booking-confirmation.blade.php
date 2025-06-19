<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #0d9488;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 0 0 5px 5px;
        }
        .details {
            margin: 20px 0;
            padding: 15px;
            background-color: white;
            border-radius: 5px;
            border: 1px solid #e5e7eb;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Confirmation</h1>
        </div>
        <div class="content">
            <p>Dear {{ $booking->user->name }},</p>
            
            <p>Thank you for booking with QSmart. Your appointment has been successfully scheduled.</p>
            
            <div class="details">
                <h2>Booking Details:</h2>
                <p><strong>Service:</strong> {{ $booking->service }}</p>
                <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') }}</p>
                <p><strong>Time:</strong> {{ \Carbon\Carbon::parse($booking->booking_time)->format('h:i A') }}</p>
                <p><strong>Branch:</strong> {{ $booking->branch }}</p>
                <p><strong>Queue Number:</strong> {{ $queueNumber }}</p>
            </div>

            <p><strong>Important Information:</strong></p>
            <ul>
                <li>Please arrive 10 minutes before your scheduled time</li>
                <li>Bring your identification document</li>
                <li>If you need to cancel or reschedule, please do so at least 24 hours before your appointment</li>
            </ul>

            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>QSmart Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html> 