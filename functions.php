<?php

if (!defined('ABSPATH')) exit;

/*
|--------------------------------------------------------------------------
| Autoload & Theme Constants
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/core/constants.php';

/*
|--------------------------------------------------------------------------
| Boot Helix Framework
|--------------------------------------------------------------------------
| Framework::create() handles everything: loads .env, all config/ files,
| registers Blade/view/template, and boots all services declared in
| config/app.php (services, providers, post_types, upload_handlers, etc.).
*/

$app = Helix\Framework::create(__DIR__);

/*
|--------------------------------------------------------------------------
| Asset Registration
|--------------------------------------------------------------------------
| Fluent asset declarations — kept here so the chainable API stays
| readable. Edit assets/styles.php, scripts.php, and fonts.php.
*/

require_once __DIR__ . '/assets/styles.php';
require_once __DIR__ . '/assets/scripts.php';
require_once __DIR__ . '/assets/fonts.php';
