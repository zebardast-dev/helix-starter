# HelixPress Development & Contribution Guide

This guide explains how to set up, develop, and contribute to the HelixPress ecosystem locally.  
HelixPress is divided into two repositories:

- **`helix-framework`** — the core package (`helix/framework`)
- **`helix-starter`** — the WordPress starter theme that consumes the framework

---

## 1. Local Development Setup (Symlinking the Framework)

To develop the framework and see changes instantly in your starter theme without publishing to a remote package registry, configure a local `path` repository in Composer.

Since committing local paths to the main `composer.json` breaks production pipelines, use one of the following methods:

### Method A: Composer Config + Git Assume-Unchanged (Recommended)

The fastest method — no extra files, no dirty diffs in other developers' clones.

```bash
# 1. Add the local repository to your starter theme
cd helix-starter
composer config repositories.helix-framework \
  '{"type":"path","url":"../helix-framework","options":{"symlink":true}}'

# 2. Tell git to stop tracking your local change to composer.json
git update-index --assume-unchanged composer.json

# 3. Install dependencies
composer install
```

> To commit real changes to `composer.json` later:
> ```bash
> git update-index --no-assume-unchanged composer.json
> ```

### Method B: Manual Merge via `composer.local.json`

```bash
# 1. Copy the example file (it is already in .gitignore)
cp composer.local.json.example composer.local.json

# 2. Merge the repositories block from composer.local.json into your local composer.json
# 3. Run composer install as usual
composer install
```

---

## 2. Architecture & Path Resolution

To ensure compatibility across customised WordPress installations (Multisite, subfolder installs, custom content directories), HelixPress uses **absolute filesystem paths** derived from `__DIR__` in `functions.php`:

```php
// functions.php
$app = Helix\Framework::create(__DIR__);
```

Rules of thumb:

| Use case | Correct API |
|---|---|
| Physical files (views, cache, config) | `$app->basePath('...')` or `$app->paths()->views()` |
| Public URLs / asset URIs | `get_theme_file_uri()` or `content_url()` |
| Debug / fallback only | `get_template_directory()` / `get_template_directory_uri()` |

> **Avoid** calling `get_template_directory()` inside framework internals — it couples the engine to global WordPress state and breaks in non-standard setups.  
> **Prefer** `get_theme_file_uri()` over `get_template_directory_uri()` for asset URLs; it handles domain mapping and CDN structures correctly.

---

## 3. Thin Bootstrap Strategy

`functions.php` is kept under 30 lines. All customisation hook-points are declared in `config/app.php`:

| Feature / Legacy hook | New location (`config/app.php`) |
|---|---|
| Core services (`Setup`, `Assets`, `Sidebars`, …) | `services[]` |
| WordPress providers (`PageTemplates`, …) | `providers[]` |
| File upload handlers (SVG, …) | `upload_handlers[]` |
| Custom post types | `post_types[]` |
| Theme-switch activation class | `on_switch_theme` |
| Elementor integration | `modules.elementor.enabled` |
| Inspector / debug panel | Auto-bootstrapped via `inspector.enabled` |

Path conventions that `PathResolver` derives automatically from `basePath`:

| Key | Default path |
|---|---|
| views | `resources/views` |
| cache | `storage/cache` |
| view cache | `storage/cache/views` |
| components | `app/View/Components` |
| composers | `app/View/Composers` |

Override any of these under `config/app.paths[]` without touching framework code.

---

## 4. Useful Commands

```bash
# After adding new classes to the framework
cd helix-framework
composer dump-autoload

# After adding new classes to the starter
cd helix-starter
composer dump-autoload

# Verify CLI is working
php helix list

# Clear compiled Blade views and discovery caches
php helix cache:clear

# Check cache status
php helix cache:status
```

---

## 5. Folder Conventions

```
helix-framework/
└── src/
    ├── Foundation/      ← Application, PathResolver
    ├── Framework.php    ← create() entry point
    ├── Config/          ← EnvLoader, Config
    ├── View/            ← Blade, composers, components
    ├── Template/        ← Hierarchy, Loader, Cache
    ├── Theme/           ← Setup, Assets, Sidebars
    ├── Console/         ← Kernel, make:* commands
    ├── Inspector/       ← debug panel + collectors
    └── helpers.php      ← global functions

helix-starter/
├── functions.php        ← thin bootstrap (~27 lines)
├── config/
│   ├── app.php          ← services, providers, modules, paths
│   ├── cache.php
│   └── inspector.php
├── app/
│   ├── View/Components/
│   ├── View/Composers/
│   ├── Repositories/
│   ├── WordPress/
│   └── Setup/
├── resources/views/     ← Blade templates
├── assets/              ← styles.php, scripts.php, fonts.php
└── storage/cache/       ← compiled views (gitignored)
```
