<?php

namespace App\WordPress;

class PageTemplates
{
    protected string $path;

    public function __construct()
    {
        $this->path = get_template_directory() . '/resources/views/templates';
    }

    public function register(): void
    {
        add_filter('theme_page_templates', [$this, 'registerTemplates']);
        add_filter('page_template',        [$this, 'resolveTemplate']);
    }

    public function registerTemplates(array $templates): array
    {
        foreach ($this->getBladeTemplates() as $file) {
            $filename              = basename($file);
            $templates['blade-template-' . $filename] = $this->getTemplateName($file);
        }

        return $templates;
    }

    public function resolveTemplate(string $template): string
    {
        $selected = get_page_template_slug();

        if (!$selected || !str_starts_with($selected, 'blade-template-')) {
            return $template;
        }

        $view = basename(str_replace('blade-template-', '', $selected), '.blade.php');

        if (!view()->exists("templates.{$view}")) {
            return $template;
        }

        set_query_var('blade_view', "templates.{$view}");
        return get_template_directory() . '/bootstrap/view.php';
    }

    protected function getBladeTemplates(): array
    {
        return is_dir($this->path) ? (glob($this->path . '/*.blade.php') ?: []) : [];
    }

    protected function getTemplateName(string $path): string
    {
        $content = file_get_contents($path);

        if (preg_match('/Template Name:\s*(.+)/', $content, $m)) {
            return trim($m[1]);
        }

        return ucwords(str_replace(['-', '_', '.blade.php'], [' ', ' ', ''], basename($path)));
    }
}
