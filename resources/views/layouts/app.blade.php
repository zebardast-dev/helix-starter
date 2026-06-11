<!DOCTYPE html>
<html {{ language_attributes() }}>
<head>
    <meta charset="{{ get_bloginfo('charset') }}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @include('partials.head')
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

@include('partials.header')

<main id="main">
    @yield('content')
</main>

@include('partials.footer')

<?php wp_footer(); ?>
</body>
</html>
