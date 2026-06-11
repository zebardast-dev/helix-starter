<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Pagination extends Component
{
    public ?string $links = null;

    public function __construct(int $max = 1)
    {
        if ($max <= 1) return;

        $current = max(
            1,
            absint(get_query_var('paged')),
            absint(get_query_var('page')),
            isset($_GET['pages']) ? absint($_GET['pages']) : 1
        );

        $base  = str_replace(999999, '%#%', esc_url(get_pagenum_link(999999)));
        $links = paginate_links([
            'base'      => $base,
            'format'    => '',
            'current'   => $current,
            'total'     => $max,
            'type'      => 'list',
            'prev_next' => true,
            'prev_text' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.76252 19.8206C8.6877 19.7564 8.62625 19.6782 8.58168 19.5903C8.53711 19.5024 8.5103 19.4066 8.50278 19.3083C8.49525 19.2101 8.50717 19.1113 8.53784 19.0177C8.56851 18.924 8.61733 18.8373 8.68152 18.7626L14.2625 12.2506L8.68152 5.73856C8.61362 5.66441 8.56132 5.57736 8.52773 5.48259C8.49414 5.38782 8.47995 5.28727 8.486 5.18691C8.49205 5.08654 8.51822 4.98842 8.56295 4.89838C8.60768 4.80833 8.67006 4.7282 8.74638 4.66274C8.8227 4.59729 8.91141 4.54784 9.00722 4.51736C9.10303 4.48687 9.20399 4.47595 9.3041 4.48526C9.40422 4.49458 9.50143 4.52392 9.58998 4.57156C9.67852 4.6192 9.75658 4.68415 9.81952 4.76256L15.8195 11.7626C15.936 11.8985 16 12.0716 16 12.2506C16 12.4295 15.936 12.6026 15.8195 12.7386L9.81952 19.7386C9.69004 19.8894 9.50598 19.9826 9.30779 19.9978C9.10959 20.013 8.91348 19.9489 8.76252 19.8196" fill="#808285"/></svg>',
            'next_text' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.2375 4.17944C15.3123 4.24357 15.3738 4.32181 15.4183 4.4097C15.4629 4.49759 15.4897 4.5934 15.4972 4.69166C15.5047 4.78991 15.4928 4.88869 15.4622 4.98234C15.4315 5.07599 15.3827 5.16267 15.3185 5.23744L9.73748 11.7494L15.3185 18.2614C15.3864 18.3356 15.4387 18.4226 15.4723 18.5174C15.5059 18.6122 15.52 18.7127 15.514 18.8131C15.5079 18.9135 15.4818 19.0116 15.437 19.1016C15.3923 19.1917 15.3299 19.2718 15.2536 19.3373C15.1773 19.4027 15.0886 19.4522 14.9928 19.4826C14.897 19.5131 14.796 19.524 14.6959 19.5147C14.5958 19.5054 14.4986 19.4761 14.41 19.4284C14.3215 19.3808 14.2434 19.3159 14.1805 19.2374L8.18048 12.2374C8.06401 12.1015 8 11.9284 8 11.7494C8 11.5705 8.06401 11.3974 8.18048 11.2614L14.1805 4.26144C14.31 4.11063 14.494 4.01738 14.6922 4.00219C14.8904 3.98701 15.0865 4.05112 15.2375 4.18044" fill="#808285"/></svg>',
        ]);

        if (!$links) return;

        $this->links = wp_kses($links, [
            'ul'   => ['class' => true],
            'li'   => ['class' => true],
            'a'    => ['href' => true, 'class' => true, 'aria-current' => true],
            'span' => ['class' => true, 'aria-current' => true],
            'svg'  => ['width' => true, 'height' => true, 'viewBox' => true, 'fill' => true, 'xmlns' => true],
            'path' => ['fill-rule' => true, 'clip-rule' => true, 'd' => true, 'fill' => true],
        ]);
    }

    public function render()
    {
        return repeatedView('components', 'pagination', 2);
    }
}
