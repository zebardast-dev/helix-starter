<?php

namespace App\Setup;

class InitialSetup
{
    public static function run(): void
    {
        if (get_option('helix_setup_done')) return;

        static::removeDefaultContent();
        $pages = static::createPages();
        static::createSamplePosts();
        static::assignTemplates($pages);
        static::setupReading($pages);
        static::createMenu($pages);
        static::setupPermalinks();
        static::setupDiscussion();

        update_option('helix_setup_done', time());
    }

    private static function removeDefaultContent(): void
    {
        foreach (['hello-world' => 'post', 'sample-page' => 'page', 'privacy-policy' => 'page'] as $slug => $type) {
            $post = get_page_by_path($slug, OBJECT, $type);
            if (!$post) continue;

            if ($type === 'post') {
                foreach (get_comments(['post_id' => $post->ID]) as $comment) {
                    wp_delete_comment($comment->comment_ID, true);
                }
            }

            wp_delete_post($post->ID, true);
        }
    }

    private static function createSamplePosts(): void
    {
        for ($i = 1; $i <= 4; $i++) {
            if (get_page_by_path("article-{$i}", OBJECT, 'post')) continue;

            wp_insert_post([
                'post_title'   => "مقاله شماره {$i}",
                'post_name'    => "article-{$i}",
                'post_status'  => 'publish',
                'post_type'    => 'post',
                'post_content' => static::sampleContent(),
            ]);
        }
    }

    private static function createPages(): array
    {
        $definitions = [
            'home'    => ['title' => 'صفحه اصلی', 'template' => 'blade-template-home.blade.php'],
            'about'   => ['title' => 'درباره ما',  'template' => 'blade-template-about.blade.php'],
            'contact' => ['title' => 'تماس با ما', 'template' => 'blade-template-contact.blade.php'],
            'blog'    => ['title' => 'مقالات',     'template' => 'blade-template-blog.blade.php'],
        ];

        $ids = [];

        foreach ($definitions as $slug => $page) {
            $existing = get_page_by_path($slug);
            $id       = $existing
                ? $existing->ID
                : wp_insert_post(['post_title' => $page['title'], 'post_name' => $slug, 'post_status' => 'publish', 'post_type' => 'page']);

            $ids[$slug] = ['id' => $id, 'template' => $page['template']];
        }

        return $ids;
    }

    private static function assignTemplates(array $pages): void
    {
        foreach ($pages as $page) {
            if (!empty($page['template'])) {
                update_post_meta($page['id'], '_wp_page_template', $page['template']);
            }
        }
    }

    private static function setupReading(array $pages): void
    {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $pages['home']['id']);
    }

    private static function createMenu(array $pages): void
    {
        $menu    = wp_get_nav_menu_object('Main Menu');
        $menu_id = $menu ? $menu->term_id : wp_create_nav_menu('Main Menu');

        foreach ($pages as $page) {
            wp_update_nav_menu_item($menu_id, 0, [
                'menu-item-title'     => get_the_title($page['id']),
                'menu-item-object'    => 'page',
                'menu-item-object-id' => $page['id'],
                'menu-item-type'      => 'post_type',
                'menu-item-status'    => 'publish',
            ]);
        }

        $locations             = get_theme_mod('nav_menu_locations');
        $locations['primary']  = $menu_id;
        set_theme_mod('nav_menu_locations', $locations);
    }

    private static function setupPermalinks(): void
    {
        update_option('permalink_structure', '/%postname%/');
        flush_rewrite_rules();
    }

    private static function setupDiscussion(): void
    {
        update_option('show_avatars',            0);
        update_option('comment_moderation',      1);
        update_option('default_ping_status',    'closed');
        update_option('default_comment_status', 'closed');
    }

    private static function sampleContent(): string
    {
        return '<p>این یک محتوای نمونه است.</p>';
    }
}
