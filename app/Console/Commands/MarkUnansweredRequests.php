<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MarkUnansweredRequests extends Command
{
    protected $signature = 'requests:mark-unanswered {--minutes= : Override the wait time}';

    protected $description = 'Mark pending incident requests with no responder as no_response';

    public function handle(): int
    {
        $minutes = (int) ($this->option('minutes') ?? config('incident.no_response_after_minutes'));

        $count = DB::table('incident_request_responses')
            ->where('status', 'pending')
            ->where('created_at', '<=', now()->subMinutes($minutes))
            ->update([
                'status'     => 'no_response',
                'updated_at' => now(),
            ]);

        $this->info("Marked {$count} request(s) as no_response (older than {$minutes} minutes).");

        return self::SUCCESS;
    }
}