@extends('layouts.app')

@section('content')
    <article>
        <h1>{{ $post->title() }}</h1>
        <div>{!! $post->content() !!}</div>
    </article>
@endsection
