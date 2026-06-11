<?php

if ($view = get_query_var('blade_view')) {
    echo app(\Helix\View\Renderer::class)->render($view);
}
