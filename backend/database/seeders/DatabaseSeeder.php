<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Amine fakkar',
        //     'email' => 'amine@gmail.com',
        //     'password' => 'Amine123@@',
        //     'email_verified_at' => now(),
        // ]);

        for ($i=0; $i < 20; $i++) {
            User::factory()->create([
                'name' => 'Amine fakkar',
                'email' => 'amine'.$i.'@gmail.com',
                'password' => 'Amine123@@',
                'email_verified_at' => now(),
            ]);
        }
    }
}
