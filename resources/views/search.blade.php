@extends('layouts.app')

@section('content')
    <h1>{{ __('Search results for:') }} {{ get_search_query() }}</h1>

    @if(have_posts())
        @while(have_posts())
            @php the_post() @endphp
            <article>
                <h2><a href="{{ get_permalink() }}">{{ get_the_title() }}</a></h2>
                <p>{{ get_the_excerpt() }}</p>
            </article>
        @endwhile
    @else
        <p>{{ __('Nothing found.') }}</p>
    @endif
@endsection
