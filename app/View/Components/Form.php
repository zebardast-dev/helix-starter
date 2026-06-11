<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Form extends Component
{
    public function render()
    {
        return repeatedView('components', 'form', 2);
    }
}
