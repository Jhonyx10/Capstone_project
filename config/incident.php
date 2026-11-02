<?php

return [
    // 120 minutes = 2 hours. Change it in .env without touching code.
    'no_response_after_minutes' => env('INCIDENT_NO_RESPONSE_MINUTES', 120),
];