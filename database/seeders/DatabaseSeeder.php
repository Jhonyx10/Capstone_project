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
        ]);

        \App\Models\IncidentCategory::insert([
            [
                'category_name' => 'Peace and Order'
            ],
            [
                'category_name' => 'Public Safety'
            ],
            [
                'category_name' => 'Ordinance Violations'
            ],
        ]);

        \App\Models\IncidentType::insert([
            [
                'category_id' => 1,
                'incident_name' => 'Physical altercation',
            ],
            [
                'category_id' => 1,
                'incident_name' => 'Public disturbance'
            ],
            [
                'category_id' => 2,
                'incident_name' => 'Traffic incident',
            ],
            [
                'category_id' => 2,
                'incident_name' => 'Fire incident'
            ],
            [
                'category_id' => 3,
                'incident_name' => 'Curfew',
            ],
            [
                'category_id' => 3,
                'incident_name' => 'Improper waste disposal'
            ],
            
        ]);

        \App\Models\Zone::insert([
            [
                'zone_name' => 'zone 1', //good
                'latitude' => 8.504415,
                'longitude' => 124.590877,
            ],
             [
                'zone_name' => 'zone 2', //good
                'latitude' => 8.509417,
                'longitude' => 124.592734,
            ],
             [
                'zone_name' => 'zone 3', //good
                'latitude' => 8.506201,
                'longitude' => 124.584375,
            ],
            [
                'zone_name' => 'zone 4', //good
                'latitude' => 8.511159,
                'longitude' => 124.585209,
            ],
            [
                'zone_name' => 'zone 5', //good
                'latitude' => 8.499722,
                'longitude' => 124.585594,
            ],
             [
                'zone_name' => 'zone 6', //good
                'latitude' => 8.491580,
                'longitude' => 124.577741,
            ],
             [
                'zone_name' => 'zone 7', //good
                'latitude' => 8.486381,
                'longitude' => 124.578444,
            ],
            [
                'zone_name' => 'zone 8', //good
                'latitude' => 8.516839,
                'longitude' => 124.591604,
            ],
        ]);

    }
}
