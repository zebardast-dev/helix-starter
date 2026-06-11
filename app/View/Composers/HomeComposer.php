<?php

namespace App\View\Composers;

use App\Repositories\PostRepository;

class HomeComposer
{
    public function __construct(protected PostRepository $posts) {}

    public function views(): array
    {
        return ['templates.home'];
    }

    public function compose(string $view, array $data = []): array
    {
        return [
            'latestPosts' => $this->posts->latest(3),
        ];
    }
}
