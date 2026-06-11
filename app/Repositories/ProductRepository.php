<?php

namespace App\Repositories;

use Helix\Models\Product;
use Helix\Query\PostCollection;
use Helix\Repositories\BaseRepository;

class ProductRepository extends BaseRepository
{
    public function find(int $id): ?Product
    {
        return $this->query()->postType('product')->id($id)->first(Product::class);
    }

    public function latest(int $limit = 12): PostCollection
    {
        return $this->query()->postType('product')->limit($limit)->orderBy('date', 'DESC')->get(Product::class);
    }

    public function onSale(int $limit = 12): PostCollection
    {
        return $this->query()->postType('product')->meta('_sale_price', 0, '>')->limit($limit)->get(Product::class);
    }
}
