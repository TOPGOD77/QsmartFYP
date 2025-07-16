<?php

return [

    'default' => env('BROADCAST_DRIVER', 'null'),

    'connections' => [

        // ... other drivers ...

        'pusher' => [
            'driver' => 'pusher',
            'key' => env('VITE_PUSHER_APP_KEY'),
            'secret' => env('VITE_PUSHER_APP_SECRET'),
            'app_id' => env('VITE_PUSHER_APP_ID'),
            'options' => [
                'cluster' => env('VITE_PUSHER_APP_CLUSTER'),
                'encrypted' => true,
                'useTLS' => true,
            ],
            'client_options' => [
                'verify' => false,
            ],
        ],

        // ... rest of file ...

    ],

];
