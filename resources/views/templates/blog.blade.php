{{-- Template Name: Blog --}}
@extends('layouts.app')

@section('content')
    @foreach($posts as $post)
        <article>
            <h2><a href="{{ $post->url() }}">{{ $post->title() }}</a></h2>
            <p>{{ $post->excerpt() }}</p>
        </article>
    @endforeach

    <x-pagination :max="$posts->pages()" />
@endsection
