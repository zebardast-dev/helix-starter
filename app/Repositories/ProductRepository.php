<?php

namespace App\Repositories;

use Helix\Models\Product;
use Helix\Query\PostCollection;
use Helix\Repositories\BaseRepository;

class ProductRepository extends BaseRepository
{
    protected string $model    = Product::class;
    protected string $postType = 'product';

    public function onSale(int $limit = 12): PostCollection
    {
        return $this->query()->meta('_sale_price', 0, '>')->limit($limit)->get($this->model);
    }
}
