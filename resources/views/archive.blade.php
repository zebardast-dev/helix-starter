@extends('layouts.app')

@section('content')
    <h1>{{ get_the_archive_title() }}</h1>

    @while(have_posts())
        @php the_post() @endphp
        <article>
            <h2><a href="{{ get_permalink() }}">{{ get_the_title() }}</a></h2>
            <p>{{ get_the_excerpt() }}</p>
        </article>
    @endwhile

    <?php the_posts_pagination() ?>
@endsection
