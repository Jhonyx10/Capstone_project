<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        \App\Models\User::insert([
           [
            'name' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            ],
            [
            'name' => 'tanod',
            'email' => 'tanod@example.com',
            'password' => Hash::make('password'),
            'role' => 'tanod',
            ],
            [
            'name' => 'guest',
            'email' => 'guest@example.com',
            'password' => Hash::make('password'),
            'role' => 'resident',
            ]
        ]);

        \App\Models\IncidentCategory::insert([
            [
                'category_name' => 'Traffic Incident'
            ],
            [
                'category_name' => 'Public Disturbance'
            ]
        ]);

        \App\Models\IncidentType::insert([
            [
                'category_id' => 1,
                'incident_name' => 'Hit And Run',
            ],
            [
                'category_id' => 2,
                'incident_name' => 'Public Intoxication'
            ]
        ]);

        \App\Models\Zone::insert([
            [
                'zone_name' => 'zone 1',
                'latitude' => 8.5042903,
                'longitude' => 124.5884631,
            ],
            [
                'zone_name' => 'zone 4B',
                'latitude' => 8.5077815,
                'longitude' => 124.5848404,
            ],
            [
                'zone_name' => 'zone 5',
                'latitude' => 8.502973,
                'longitude' => 124.5824682,
            ],
            [
                'zone_name' => 'zone 8',
                'latitude' => 8.5164216,
                'longitude' => 124.5883361,
            ],
        ]);

    }
}
