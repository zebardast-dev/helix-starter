<?php

return [

    /*
     * Enable the Helix Inspector panel.
     * Reads APP_DEBUG from .env — never enable in production.
     */
    'enabled' => (bool) env('APP_DEBUG', false),

    /*
     * Collectors to activate.
     * Remove a key to disable that collector.
     */
    'collectors' => [
        'performance',
        'queries',
        'views',
        'seo',
    ],

];
