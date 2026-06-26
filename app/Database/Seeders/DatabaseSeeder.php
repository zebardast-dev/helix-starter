<?php

namespace App\Database\Seeders;

use Helix\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(
            PostSeeder::class,
        );
    }
}
