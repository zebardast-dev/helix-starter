<?php

namespace App\View\Composers;

use App\Repositories\PostRepository;

class BlogComposer
{
    public function __construct(protected PostRepository $posts) {}

    public function views(): array
    {
        return ['templates.blog'];
    }

    public function compose(string $view, array $data = []): array
    {
        return [
            'posts' => $this->posts->paginate(10),
        ];
    }
}
