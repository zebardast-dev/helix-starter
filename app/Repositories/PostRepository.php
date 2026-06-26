<?php

namespace App\Repositories;

use Helix\Models\Post;
use Helix\Repositories\BaseRepository;

class PostRepository extends BaseRepository
{
    protected string $model    = Post::class;
    protected string $postType = 'post';
}
