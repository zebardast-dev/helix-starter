<?php

if (!defined('ABSPATH')) exit;

/*
|--------------------------------------------------------------------------
| 1. Autoload & Constants
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/core/helpers.php';
require_once __DIR__ . '/vendor/autoload.php';
require_once get_template_directory() . '/core/constants.php';

/*
|--------------------------------------------------------------------------
| 2. Environment & Config
|--------------------------------------------------------------------------
*/

Helix\Config\EnvLoader::load(THEME_DIR . '/.env');
Helix\Config\Config::load(THEME_DIR . '/config');

/*
|--------------------------------------------------------------------------
| 3. Boot Helix Framework
|--------------------------------------------------------------------------
*/

$app = Helix\Framework::boot([
    'views_path'           => THEME_DIR . '/resources/views',
    'cache_path'           => THEME_DIR . '/storage/cache',
    'components_path'      => THEME_DIR . '/app/View/Components',
    'components_namespace' => 'App\\View\\Components\\',
    'composers_path'       => THEME_DIR . '/app/View/Composers',
    'composers_namespace'  => 'App\\View\\Composers\\',
    'template_file'        => THEME_DIR . '/bootstrap/view.php',
]);

/*
|--------------------------------------------------------------------------
| 4. Load Services
|--------------------------------------------------------------------------
*/

$services = require THEME_DIR . '/core/services.php';

foreach ($services as $service) {
    $app->make($service);
}

/*
|--------------------------------------------------------------------------
| 5. Optional Modules
|--------------------------------------------------------------------------
*/

if (did_action('elementor/loaded')) {
    $app->make(Helix\Modules\Elementor\Elementor::class);
}

/*
|--------------------------------------------------------------------------
| 6. Assets
|--------------------------------------------------------------------------
*/

require_once THEME_DIR . '/assets/styles.php';
require_once THEME_DIR . '/assets/scripts.php';
require_once THEME_DIR . '/assets/fonts.php';

/*
|--------------------------------------------------------------------------
| 7. WordPress Hooks
|--------------------------------------------------------------------------
*/

add_action('after_setup_theme', function () use ($app) {
    $app->make(App\WordPress\PageTemplates::class)->register();
});

add_action('after_switch_theme', ['App\Setup\InitialSetup', 'run']);
