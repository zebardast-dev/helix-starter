<?php

return [
    'name'     => env('APP_NAME', 'My Theme'),
    'env'      => env('APP_ENV', 'production'),
    'debug'    => (bool) env('APP_DEBUG', false),
    'timezone' => env('APP_TIMEZONE', 'UTC'),
    'url'          => env('APP_URL', ''),
    'faker_locale' => env('FAKER_LOCALE', 'en_US'),
];
