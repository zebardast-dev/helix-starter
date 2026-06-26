<?php

if (!defined('ABSPATH')) exit;

define('THEME_DIR',  get_template_directory());
define('THEME_URI',  get_template_directory_uri());
define('THEME_VERSION', wp_get_theme()->get('Version'));

define('ASSETS_URI', THEME_URI  . '/public');
define('ASSETS_DIR', THEME_DIR  . '/public');
define('IMAGES_URI', ASSETS_URI . '/images');
define('NO_IMAGE',   IMAGES_URI . '/no-image.png');

define('OPTIONS_KEY', 'theme_options');
define('OPTIONS',     get_option(OPTIONS_KEY, []));
