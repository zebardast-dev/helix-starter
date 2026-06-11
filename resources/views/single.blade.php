@extends('layouts.app')

@section('content')
    <article>
        <h1>{{ $post->title() }}</h1>
        <time>{{ $post->date() }}</time>
        <div>{!! $post->content() !!}</div>
    </article>
@endsection
