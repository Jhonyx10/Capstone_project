<?php

namespace App\Support;

class Phone
{
    public static function normalize(string $input): ?string
    {
        $digits = preg_replace('/\D/', '', $input);

        if (preg_match('/^(63|0)?(9\d{9})$/', $digits, $m)) {
            return '+63' . $m[2];   // always +639XXXXXXXXX
        }

        return null; // not a valid PH mobile number
    }
}