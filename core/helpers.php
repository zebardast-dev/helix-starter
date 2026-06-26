<?php

if (!function_exists('env')) {
    function env(string $key, mixed $default = null): mixed
    {
        return \Helix\Config\Config::env($key, $default);
    }
}

if (!function_exists('config')) {
    function config(?string $key = null, mixed $default = null): mixed
    {
        if ($key === null) {
            return \Helix\Config\Config::all();
        }
        return \Helix\Config\Config::get($key, $default);
    }
}
