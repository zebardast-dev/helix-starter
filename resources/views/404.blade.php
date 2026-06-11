@extends('layouts.app')

@section('content')
    <h1>{{ __('Page not found') }}</h1>
    <p>{{ __('The page you are looking for does not exist.') }}</p>
    <a href="{{ home_url('/') }}">{{ __('Back to home') }}</a>
@endsection
