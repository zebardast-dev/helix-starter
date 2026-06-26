<?php

return [
    'templates' => (bool) env('CACHE_TEMPLATES', false),
    'expire'    => (int)  env('CACHE_EXPIRE', 3600),
];
