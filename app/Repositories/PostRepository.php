<?php

namespace App\Repositories;

use Helix\Models\Post;
use Helix\Query\PostCollection;
use Helix\Repositories\BaseRepository;

class PostRepository extends BaseRepository
{
    public function find(int $id): ?Post
    {
        return $this->query()->postType('post')->id($id)->first(Post::class);
    }

    public function findBySlug(string $slug): ?Post
    {
        return $this->query()->postType('post')->slug($slug)->first(Post::class);
    }

    public function latest(int $limit = 10): PostCollection
    {
        return $this->query()->postType('post')->limit($limit)->orderBy('date', 'DESC')->get(Post::class);
    }

    public function paginate(int $perPage = 10): PostCollection
    {
        return $this->query()->postType('post')->orderBy('date', 'DESC')->paginate($perPage, Post::class);
    }
}
