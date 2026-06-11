@extends('layouts.app')

@section('content')
    <h1>{{ get_bloginfo('name') }}</h1>
    <p>{{ get_bloginfo('description') }}</p>
@endsection
