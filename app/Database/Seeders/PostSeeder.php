<?php

namespace App\Database\Seeders;

use Helix\Database\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $fake = $this->fake();

        foreach (range(1, 5) as $i) {
            $id = $this->post([
                'post_title'   => $fake->realText(50, 1),
                'post_content' => $fake->realText(600),
                'post_excerpt' => $fake->realText(120, 1),
                'post_type'    => 'post',
            ]);

            // if ($id) {
            //     $this->meta($id, '_my_field', $fake->realText(50, 1));
            // }
        }
    }
}
