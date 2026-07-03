<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Application Identity
    |--------------------------------------------------------------------------
    */

    'name'         => env('APP_NAME', 'My Theme'),
    'env'          => env('APP_ENV', 'production'),
    'debug'        => (bool) env('APP_DEBUG', false),
    'timezone'     => env('APP_TIMEZONE', 'UTC'),
    'url'          => env('APP_URL', ''),
    'faker_locale' => env('FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Core Services
    |--------------------------------------------------------------------------
    | Instantiated immediately on boot via $app->make(). Classes self-register
    | through their constructors (e.g. add_action / add_filter calls).
    */

    'services' => [
        Helix\Theme\Setup::class,
        Helix\Theme\Assets::class,
        Helix\Theme\Sidebars::class,
        Helix\Support\Cleanup::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Handlers
    |--------------------------------------------------------------------------
    | Handler classes passed to Helix\Media\FileUploader::allow().
    */

    'upload_handlers' => [
        Helix\Media\Handlers\SvgHandler::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | WordPress Providers
    |--------------------------------------------------------------------------
    | Instantiated on after_setup_theme; each must expose a register() method.
    */

    'providers' => [
        App\WordPress\PageTemplates::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Theme Switch Handler
    |--------------------------------------------------------------------------
    | Class with a static run() method called on after_switch_theme.
    | Set to null to disable.
    */

    'on_switch_theme' => App\Setup\InitialSetup::class,

    /*
    |--------------------------------------------------------------------------
    | Custom Post Types
    |--------------------------------------------------------------------------
    | Registered on the WordPress init hook. Each class must expose register().
    */

    'post_types' => [
        // App\PostTypes\ProjectPostType::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Optional Modules
    |--------------------------------------------------------------------------
    */

    'modules' => [
        'elementor' => [
            'enabled' => class_exists(\Elementor\Plugin::class),
        ],
        'woocommerce' => [
            'enabled' => class_exists(\WooCommerce::class),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Path Overrides (optional)
    |--------------------------------------------------------------------------
    | Override the default paths that PathResolver derives from basePath.
    | Leave empty to use the conventions: resources/views, storage/cache, etc.
    */

    'paths' => [
        // 'views'               => '/absolute/path/to/views',
        // 'cache'               => '/absolute/path/to/cache',
        // 'components'          => '/absolute/path/to/Components',
        // 'components_namespace'=> 'App\\View\\Components\\',
        // 'composers'           => '/absolute/path/to/Composers',
        // 'composers_namespace' => 'App\\View\\Composers\\',
    ],

];
