<?php

namespace App\Setup;

class InitialSetup
{
    // =========================================================
    // Configuration — edit these to match your project
    // =========================================================

    /**
     * Pages to create on activation: ['slug' => 'Title']
     */
    protected static array $pages = [
        'home'    => 'Home',
        'about'   => 'About',
        'blog'    => 'Blog',
        'contact' => 'Contact',
    ];

    /** Slug of the static front page */
    protected static string $frontPage = 'home';

    /** Slug of the posts archive page (empty string to disable) */
    protected static string $blogPage = 'blog';

    /** Navigation menu name and theme location */
    protected static string $menuName     = 'Main Menu';
    protected static string $menuLocation = 'primary';

    /**
     * Slugs to add to the menu, in order.
     * null = all pages defined in $pages above.
     */
    protected static ?array $menuPages = null;

    /** WordPress permalink structure */
    protected static string $permalinkStructure = '/%postname%/';

    /** Disable comments and pings site-wide */
    protected static bool $closeComments = true;

    // =========================================================
    // Custom setup — override this method to add your own steps
    // =========================================================

    protected static function setup(): void
    {
        // update_option('blogdescription', 'Site tagline');
        // update_option('posts_per_page', 12);
        // update_option('woocommerce_currency', 'IRT');
    }

    // =========================================================
    // Internal — do not edit below
    // =========================================================

    public static function run(): void
    {
        if (get_option('helix_setup_done')) {
            return;
        }

        static::removeDefaultContent();
        $pageIds = static::createPages();
        static::assignTemplates($pageIds);
        static::setupReading($pageIds);
        static::createMenu($pageIds);
        static::setupPermalinks();

        if (static::$closeComments) {
            static::setupDiscussion();
        }

        static::setup();

        update_option('helix_setup_done', time());
    }

    private static function removeDefaultContent(): void
    {
        $defaults = [
            'hello-world'    => 'post',
            'sample-page'    => 'page',
            'privacy-policy' => 'page',
        ];

        foreach ($defaults as $slug => $type) {
            $post = get_page_by_path($slug, OBJECT, $type);
            if (!$post) {
                continue;
            }

            if ($type === 'post') {
                foreach (get_comments(['post_id' => $post->ID]) as $comment) {
                    wp_delete_comment($comment->comment_ID, true);
                }
            }

            wp_delete_post($post->ID, true);
        }
    }

    private static function createPages(): array
    {
        $ids = [];

        foreach (static::$pages as $slug => $title) {
            $existing  = get_page_by_path($slug);
            $ids[$slug] = $existing
                ? $existing->ID
                : (int) wp_insert_post([
                    'post_title'  => $title,
                    'post_name'   => $slug,
                    'post_status' => 'publish',
                    'post_type'   => 'page',
                ]);
        }

        return $ids;
    }

    private static function assignTemplates(array $pageIds): void
    {
        $dir = get_template_directory();

        foreach ($pageIds as $slug => $id) {
            $template = "blade-template-{$slug}.blade.php";
            if (file_exists("{$dir}/{$template}")) {
                update_post_meta($id, '_wp_page_template', $template);
            }
        }
    }

    private static function setupReading(array $pageIds): void
    {
        update_option('show_on_front', 'page');

        if (isset($pageIds[static::$frontPage])) {
            update_option('page_on_front', $pageIds[static::$frontPage]);
        }

        if (static::$blogPage !== '' && isset($pageIds[static::$blogPage])) {
            update_option('page_for_posts', $pageIds[static::$blogPage]);
        }
    }

    private static function createMenu(array $pageIds): void
    {
        $menu   = wp_get_nav_menu_object(static::$menuName);
        $menuId = $menu ? $menu->term_id : wp_create_nav_menu(static::$menuName);

        $existing    = wp_get_nav_menu_items($menuId) ?: [];
        $existingIds = array_map(fn($item) => (int) $item->object_id, $existing);

        $slugs = static::$menuPages ?? array_keys(static::$pages);

        foreach ($slugs as $slug) {
            if (!isset($pageIds[$slug])) {
                continue;
            }

            $pageId = $pageIds[$slug];

            if (in_array($pageId, $existingIds, true)) {
                continue;
            }

            wp_update_nav_menu_item($menuId, 0, [
                'menu-item-title'     => get_the_title($pageId),
                'menu-item-object'    => 'page',
                'menu-item-object-id' => $pageId,
                'menu-item-type'      => 'post_type',
                'menu-item-status'    => 'publish',
            ]);
        }

        $locations                        = get_theme_mod('nav_menu_locations') ?: [];
        $locations[static::$menuLocation] = $menuId;
        set_theme_mod('nav_menu_locations', $locations);
    }

    private static function setupPermalinks(): void
    {
        update_option('permalink_structure', static::$permalinkStructure);
        flush_rewrite_rules();
    }

    private static function setupDiscussion(): void
    {
        update_option('default_comment_status', 'closed');
        update_option('default_ping_status',    'closed');
        update_option('comment_moderation',      1);
        update_option('show_avatars',            0);
    }
}
